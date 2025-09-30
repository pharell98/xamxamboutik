package sn.boutique.xamxamboutik.Service.approvisionnement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Service.produit.CategorieService;
import sn.boutique.xamxamboutik.Service.produit.IProduitService;
import sn.boutique.xamxamboutik.Util.ProduitUtils;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ApprovisionnementExcelMapperImpl;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementExcelRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelApproImportService implements IExcelApproImportService {

    private final IProduitService produitService;
    private final ApprovisionnementService approvisionnementService;
    private final CategorieService categorieService;
    private final ApprovisionnementExcelMapperImpl approvisionnementExcelMapper;
    private final ProduitRepository produitRepository; // Ajout du repository direct
    private final TransactionTemplate transactionTemplate;

    // Verrouillage synchronisé pour garantir l'atomicité
    private static final Object IMPORT_LOCK = new Object();

    private static final String LIBELLE_NULL = "Le libellé du produit est obligatoire";
    private static final String CATEGORIE_NULL = "Le nom de la catégorie est obligatoire";
    private static final String STOCK_NEGATIF = "Le stock disponible ne peut pas être négatif";
    private static final String PRIX_ACHAT_NEGATIF = "Le prix d'achat ne peut pas être négatif";
    private static final String PRODUIT_SUPPRIME = "Le produit avec le code %s est supprimé";

    @Override
    public Map<String, Object> importProduitsExcel(List<ApprovisionnementExcelRequestDTO> produitsExcel) throws Exception {
        log.info("Début de l'import Excel");

        synchronized (IMPORT_LOCK) {
            return transactionTemplate.execute(status -> {
                try {
                    // Convertir les DTOs Excel vers les DTOs standard
                    List<ProduitRequestDTO> produitsStandard = approvisionnementExcelMapper.toProduitRequestDTOs(produitsExcel);

                    // Validation et traitement des catégories
                    List<String> errors = validateAndProcessCategories(produitsStandard);

                    if (!errors.isEmpty()) {
                        log.error("Erreurs de validation détectées: {}", errors);
                        status.setRollbackOnly();
                        return createErrorResponse(errors);
                    }

                    // Calcul des frais de transport par unité
                    double fraisParUnite = calculateFraisParUnite(produitsStandard, null);

                    // Créer l'approvisionnement
                    Approvisionnement appro = approvisionnementService.createApprovisionnementExcelBatch(approvisionnementService.generateExcelApproCode());

                    // Traiter tous les produits
                    List<Produit> produitsEnregistres = processProducts(produitsStandard, fraisParUnite, appro);

                    if (produitsEnregistres.isEmpty()) {
                        log.error("Aucun produit valide - rollback de la transaction");
                        status.setRollbackOnly();
                        return createErrorResponse(List.of("Aucun produit valide trouvé"));
                    }

                    // Finaliser l'approvisionnement
                    approvisionnementService.finalizeAndSaveApprovisionnement(appro);

                    log.info("Import Excel terminé avec succès");

                    return createSuccessResponse(appro, produitsEnregistres);

                } catch (Exception e) {
                    log.error("Erreur lors de l'import Excel - Transaction sera rollback: {}", e.getMessage(), e);
                    status.setRollbackOnly();
                    throw new RuntimeException("Erreur lors de l'import Excel", e);
                }
            });
        }
    }

    /**
     * Valide et traite les catégories pour tous les produits
     */
    private List<String> validateAndProcessCategories(List<ProduitRequestDTO> produitsStandard) {
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < produitsStandard.size(); i++) {
            ProduitRequestDTO dto = produitsStandard.get(i);
            List<String> rowErrors = new ArrayList<>();

            // Normalisation du nom de la catégorie
            normalizeCategorieName(dto);

            // Validations de base
            validateBasicFields(dto, rowErrors);

            // Validation et création automatique de la catégorie
            processCategory(dto, rowErrors);

            // Validation du statut (produit supprimé)
            validateProductStatus(dto, rowErrors);

            // Collecte des erreurs de cette ligne
            int finalI = i;
            rowErrors.forEach(msg -> errors.add("Ligne " + (finalI + 1) + " : " + msg));
        }

        return errors;
    }

    /**
     * Normalise le nom de la catégorie
     */
    private void normalizeCategorieName(ProduitRequestDTO dto) {
        if (dto.getCategorieName() != null) {
            String normalized = dto.getCategorieName()
                    .replace('\u00A0', ' ')
                    .trim()
                    .replaceAll("\\s+", " ");
            dto.setCategorieName(normalized);
        }
    }

    /**
     * Valide les champs de base
     */
    private void validateBasicFields(ProduitRequestDTO dto, List<String> rowErrors) {
        if (dto.getLibelle() == null || dto.getLibelle().isBlank()) {
            rowErrors.add(LIBELLE_NULL);
        }
        if (dto.getCategorieName() == null || dto.getCategorieName().isBlank()) {
            rowErrors.add(CATEGORIE_NULL);
        }
        if (dto.getStockDisponible() != null && dto.getStockDisponible() < 0) {
            rowErrors.add(STOCK_NEGATIF);
        }
        if (dto.getPrixAchat() != null && dto.getPrixAchat() < 0) {
            rowErrors.add(PRIX_ACHAT_NEGATIF);
        }
    }

    /**
     * Traite la catégorie (recherche ou création)
     */
    private void processCategory(ProduitRequestDTO dto, List<String> rowErrors) {
        if (dto.getCategorieName() != null && !dto.getCategorieName().isBlank()) {
            String name = dto.getCategorieName();

            // Recherche de la catégorie existante
            Optional<sn.boutique.xamxamboutik.Entity.produit.Categorie> catOpt =
                    categorieService.findByLibelle(name)
                            .or(() -> categorieService.searchByLibelle(
                                            name, PageRequest.of(0, 10))
                                    .getContent()
                                    .stream()
                                    .filter(c -> c.getLibelle().equalsIgnoreCase(name))
                                    .findFirst()
                            );

            if (catOpt.isPresent()) {
                dto.setCategorieId(catOpt.get().getId());
            } else {
                // Création automatique de la catégorie
                try {
                    String normalizedName = normalizeCategorieName(name);
                    sn.boutique.xamxamboutik.Entity.produit.Categorie nouvelleCategorie = new sn.boutique.xamxamboutik.Entity.produit.Categorie();
                    nouvelleCategorie.setLibelle(normalizedName);
                    sn.boutique.xamxamboutik.Entity.produit.Categorie categorieCreee = categorieService.save(nouvelleCategorie);
                    dto.setCategorieId(categorieCreee.getId());
                    log.info("Catégorie créée automatiquement : '{}' (normalisée: '{}')", name, normalizedName);
                } catch (Exception e) {
                    rowErrors.add("Erreur lors de la création de la catégorie '" + name + "' : " + e.getMessage());
                }
            }
        }
    }

    /**
     * Valide le statut du produit
     */
    private void validateProductStatus(ProduitRequestDTO dto, List<String> rowErrors) {
        produitService.findByCode(dto.getCodeProduit())
                .filter(Produit::isDeleted)
                .ifPresent(p -> rowErrors.add(String.format(PRODUIT_SUPPRIME, dto.getCodeProduit())));
    }

    /**
     * Calcule les frais par unité (seulement pour les produits avec stock > 0)
     */
    private double calculateFraisParUnite(List<ProduitRequestDTO> produitsStandard, Double fraisTransport) {
        int totalQuantite = produitsStandard.stream()
                .mapToInt(dto -> Optional.ofNullable(dto.getStockDisponible()).orElse(0))
                .filter(qty -> qty > 0) // Seulement les produits avec stock > 0
                .sum();

        return (fraisTransport != null && totalQuantite > 0) ? fraisTransport / totalQuantite : 0.0;
    }

    /**
     * Traite tous les produits
     */
    private List<Produit> processProducts(List<ProduitRequestDTO> produitsStandard, double fraisParUnite, Approvisionnement appro) {
        List<Produit> produitsEnregistres = new ArrayList<>();

        for (ProduitRequestDTO dto : produitsStandard) {
            Produit p = processSingleProduit(dto, fraisParUnite);
            int qte = Optional.ofNullable(dto.getStockDisponible()).orElse(0);

            if (qte > 0) {
                approvisionnementService.addExcelDetail(appro, p, qte, dto.getPrixAchat());
            }
            produitsEnregistres.add(p);
        }

        return produitsEnregistres;
    }

    /**
     * Traite un produit individuel (création ou mise à jour)
     */
    private Produit processSingleProduit(ProduitRequestDTO dto, double fraisParUnite) {
        Optional<Produit> existingProduct = findExistingProduct(dto);

        if (existingProduct.isPresent()) {
            return updateExistingProduct(existingProduct.get(), dto, fraisParUnite);
        } else {
            return createNewProduct(dto, fraisParUnite);
        }
    }

    /**
     * Recherche intelligente d'un produit existant
     */
    private Optional<Produit> findExistingProduct(ProduitRequestDTO dto) {
        String normalizedLibelle = dto.getLibelle().trim().toLowerCase();

        // Recherche par libellé normalisé
        Optional<Produit> opt = produitService.findByLibelleOnly(normalizedLibelle);

        // Recherche alternative par libellé + catégorie si nécessaire
        if (opt.isEmpty() && dto.getCategorieId() != null) {
            opt = produitService.findByLibelleAndCategorie(normalizedLibelle, dto.getCategorieId());
        }

        // En dernier recours, recherche par code produit
        if (opt.isEmpty()) {
            opt = produitService.findByCode(dto.getCodeProduit());
        }

        return opt;
    }

    /**
     * Met à jour un produit existant
     */
    private Produit updateExistingProduct(Produit p, ProduitRequestDTO dto, double fraisParUnite) {
        // Lecture fraîche depuis la base pour éviter les problèmes de cache
        Produit freshProduct = produitRepository.findById(p.getId()).orElse(p);
        int oldStock = freshProduct.getStockDisponible();
        double oldCMA = freshProduct.getCoupMoyenAcquisition();
        int newStock = Optional.ofNullable(dto.getStockDisponible()).orElse(0);
        double newPrixAchat = Optional.ofNullable(dto.getPrixAchat()).orElse(0.0) + fraisParUnite;
        double prixAchatBrut = Optional.ofNullable(dto.getPrixAchat()).orElse(0.0);

        // Mise à jour du CMA et du stock
        updateProductCMAAndStock(freshProduct, oldStock, oldCMA, newStock, newPrixAchat, prixAchatBrut, freshProduct.getPrixAchat());

        // Mise à jour des autres informations
        updateProductInfo(freshProduct, dto);

        return produitRepository.save(freshProduct);
    }

    /**
     * Met à jour le CMA et le stock d'un produit
     */
    private void updateProductCMAAndStock(Produit p, int oldStock, double oldCMA, int newStock,
                                          double newPrixAchat, double prixAchatBrut, double oldPrixAchat) {
        if (newStock > 0) {
            // Il y a du nouveau stock - recalculer le CMA
            double nouveauCMA = ProduitUtils.calculerCoupMoyenAcquisition(oldStock, oldCMA, newStock, newPrixAchat);
            p.setCoupMoyenAcquisition(nouveauCMA);
            p.setStockDisponible(oldStock + newStock);
        } else if (ProduitUtils.prixSignificativementDifferent(prixAchatBrut, oldPrixAchat, 0.01)) {
            // Le prix d'achat a changé mais pas de nouveau stock
            p.setCoupMoyenAcquisition(prixAchatBrut);
        }
    }

    /**
     * Met à jour les informations du produit
     */
    private void updateProductInfo(Produit p, ProduitRequestDTO dto) {
        // Code produit: mise à jour si fourni et différent
        if (dto.getCodeProduit() != null && !dto.getCodeProduit().isBlank()
                && (p.getCodeProduit() == null || !p.getCodeProduit().equals(dto.getCodeProduit()))) {
            p.setCodeProduit(dto.getCodeProduit());
        }

        // Libellé: ne pas modifier pour éviter les problèmes de concurrence

        // Prix d'achat: mise à jour si fourni et différent
        if (dto.getPrixAchat() != null) {
            Double newPa = dto.getPrixAchat();
            if (p.getPrixAchat() == null || Double.compare(p.getPrixAchat(), newPa) != 0) {
                p.setPrixAchat(newPa);
            }
        }

        // Prix de vente: mise à jour si fourni et différent
        if (dto.getPrixVente() != null) {
            Double newPv = dto.getPrixVente();
            if (p.getPrixVente() == null || Double.compare(p.getPrixVente(), newPv) != 0) {
                p.setPrixVente(newPv);
            }
        }

        // Seuil de rupture: mise à jour si fourni et différent
        if (dto.getSeuilRuptureStock() != null) {
            Integer newSeuil = dto.getSeuilRuptureStock();
            if (p.getSeuilRuptureStock() == null || !p.getSeuilRuptureStock().equals(newSeuil)) {
                p.setSeuilRuptureStock(newSeuil);
            }
        }
    }

    /**
     * Crée un nouveau produit ou met à jour un existant
     */
    private Produit createNewProduct(ProduitRequestDTO dto, double fraisParUnite) {
        // Recherche pour éviter les doublons
        Optional<Produit> existingProduct = findExistingProduct(dto);

        if (existingProduct.isPresent()) {
            return updateExistingProduct(existingProduct.get(), dto, fraisParUnite);
        }

        try {
            // Créer un nouveau produit
            Produit p = produitService.saveWithoutAppro(dto, null);
            double nouveauCMA = Math.round((dto.getPrixAchat() + fraisParUnite) * 100.0) / 100.0;
            p.setCoupMoyenAcquisition(nouveauCMA);
            p.setPrixAchat(dto.getPrixAchat());

            return produitRepository.save(p);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du produit " + dto.getLibelle(), e);
        }
    }

    /**
     * Crée une réponse d'erreur
     */
    private Map<String, Object> createErrorResponse(List<String> errors) {
        Map<String, Object> out = new HashMap<>();
        out.put("approvisionnement", null);
        out.put("produitsEnregistres", Collections.emptyList());
        out.put("erreurs", errors);
        return out;
    }

    /**
     * Crée une réponse de succès
     */
    private Map<String, Object> createSuccessResponse(Approvisionnement appro, List<Produit> produitsEnregistres) {
        Map<String, Object> out = new HashMap<>();
        out.put("approvisionnement", appro);
        out.put("produitsEnregistres", produitsEnregistres);
        out.put("erreurs", Collections.emptyList());
        return out;
    }


    /**
     * Normalise le nom d'une catégorie pour éviter les doublons
     */
    private String normalizeCategorieName(String name) {
        if (name == null) {
            return null;
        }

        return name.trim()
                .toLowerCase()
                .replaceAll("\\s+", " ");
    }


}