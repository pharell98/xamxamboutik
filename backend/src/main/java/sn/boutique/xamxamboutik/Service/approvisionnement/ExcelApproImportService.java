package sn.boutique.xamxamboutik.Service.approvisionnement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Service.produit.CategorieService;
import sn.boutique.xamxamboutik.Service.produit.IProduitService;
import sn.boutique.xamxamboutik.Util.ProduitUtils;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementExcelRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ApprovisionnementExcelMapperImpl;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.annotation.Isolation;

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

    private static final String LIBELLE_NULL       = "Le libellé du produit est obligatoire";
    private static final String CATEGORIE_NULL     = "Le nom de la catégorie est obligatoire";
    private static final String STOCK_NEGATIF      = "Le stock disponible ne peut pas être négatif";
    private static final String PRIX_ACHAT_NEGATIF = "Le prix d'achat ne peut pas être négatif";
    private static final String PRODUIT_SUPPRIME   = "Le produit avec le code %s est supprimé";
    private static final String CAT_INTROUVABLE    = "Catégorie non trouvée pour : %s";

    @Override
    public Map<String, Object> importProduitsExcel(List<ApprovisionnementExcelRequestDTO> produitsExcel) throws Exception {
        log.info("DEBUG - Début de l'import Excel - Transaction ACID avec isolation SERIALIZABLE démarrée");
        
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
                        return createErrorResponse(Arrays.asList("Aucun produit valide trouvé"));
                    }
                    
                    // Finaliser l'approvisionnement
                    approvisionnementService.finalizeAndSaveApprovisionnement(appro);
                    
                    log.info("DEBUG - Fin de l'import Excel - Transaction ACID prête à être commitée");
                    verifyDataPersistence(produitsEnregistres);
                    log.info("DEBUG - Transaction ACID terminée avec succès - Commit imminent");
                    
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
        log.info("DEBUG - Valeurs reçues dans DTO: codeProduit={}, libelle={}, prixAchat={}, prixVente={}, stockDisponible={}, categorieId={}", 
                dto.getCodeProduit(), dto.getLibelle(), dto.getPrixAchat(), dto.getPrixVente(), 
                dto.getStockDisponible(), dto.getCategorieId());
        
        // Recherche intelligente du produit
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
        // Normaliser le libellé (supprimer les espaces en début/fin)
        String normalizedLibelle = dto.getLibelle().trim();
        log.info("DEBUG - Recherche produit pour: libelle='{}' (normalisé: '{}'), code='{}', categorieId={}", 
                dto.getLibelle(), normalizedLibelle, dto.getCodeProduit(), dto.getCategorieId());
        
        // Recherche PRINCIPALE par libellé normalisé
        Optional<Produit> opt = produitService.findByLibelleOnly(normalizedLibelle);
        
        if (opt.isPresent()) {
            log.info("DEBUG - Produit trouvé par libellé normalisé: {} (ID: {}, Code: {})", 
                    opt.get().getLibelle(), opt.get().getId(), opt.get().getCodeProduit());
        } else {
            log.info("DEBUG - Produit non trouvé par libellé normalisé: '{}'", normalizedLibelle);
            
            // Si pas trouvé, essayer par libellé + catégorie
            if (dto.getCategorieId() != null) {
                opt = produitService.findByLibelleAndCategorie(normalizedLibelle, dto.getCategorieId());
                if (opt.isPresent()) {
                    log.info("DEBUG - Produit trouvé par libellé+catégorie: {} (ID: {}, Code: {})", 
                            opt.get().getLibelle(), opt.get().getId(), opt.get().getCodeProduit());
                } else {
                    log.info("DEBUG - Produit non trouvé par libellé+catégorie: '{}' + catégorie {}", 
                            normalizedLibelle, dto.getCategorieId());
                }
            }
            
            // En dernier recours, chercher par code produit
            if (opt.isEmpty()) {
                opt = produitService.findByCode(dto.getCodeProduit());
                if (opt.isPresent()) {
                    log.info("DEBUG - Produit trouvé par code: {} (ID: {}, Code: {})", 
                            opt.get().getLibelle(), opt.get().getId(), opt.get().getCodeProduit());
                } else {
                    log.info("DEBUG - Produit non trouvé par code: '{}'", dto.getCodeProduit());
                }
            }
        }
        
        return opt;
    }

    /**
     * Met à jour un produit existant
     */
    private Produit updateExistingProduct(Produit p, ProduitRequestDTO dto, double fraisParUnite) {
        log.info("DEBUG - Produit trouvé: {} (ID: {}, Code: {})", p.getLibelle(), p.getId(), p.getCodeProduit());
        
        int oldStock = p.getStockDisponible();
        double oldCMA = p.getCoupMoyenAcquisition();
        int newStock = Optional.ofNullable(dto.getStockDisponible()).orElse(0);
        double newPrixAchat = Optional.ofNullable(dto.getPrixAchat()).orElse(0.0) + fraisParUnite;
        double oldPrixAchat = p.getPrixAchat();
        double prixAchatBrut = Optional.ofNullable(dto.getPrixAchat()).orElse(0.0);

        log.info("DEBUG - Calculs: Ancien stock={}, Nouveau stock={}, Ancien CMA={}, Nouveau prix={}", 
                oldStock, newStock, oldCMA, newPrixAchat);

        // Mise à jour du CMA et du stock
        updateProductCMAAndStock(p, oldStock, oldCMA, newStock, newPrixAchat, prixAchatBrut, oldPrixAchat);

        // Mise à jour des autres informations
        updateProductInfo(p, dto);

        log.info("DEBUG - Avant sauvegarde explicite - Produit: {} (ID: {}, Stock: {}, CMA: {})", 
                p.getLibelle(), p.getId(), p.getStockDisponible(), p.getCoupMoyenAcquisition());

        // Persistance explicite en utilisant directement le repository pour rester dans la même transaction
        Produit updatedProduit = produitRepository.save(p);
        
        log.info("DEBUG - Après sauvegarde explicite - Produit: {} (ID: {}, Stock: {}, CMA: {})", 
                updatedProduit.getLibelle(), updatedProduit.getId(), 
                updatedProduit.getStockDisponible(), updatedProduit.getCoupMoyenAcquisition());
        
        log.info("Produit mis à jour avec succès en base: {} (ID: {}, CMA final: {}, Stock final: {})", 
                updatedProduit.getLibelle(), updatedProduit.getId(), 
                updatedProduit.getCoupMoyenAcquisition(), updatedProduit.getStockDisponible());
        
        return updatedProduit;
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
            
            log.info("Mise à jour du produit existant avec nouveau stock : {} (stock: {} + {} = {}, CMA: {} → {})", 
                    p.getLibelle(), oldStock, newStock, p.getStockDisponible(), oldCMA, nouveauCMA);
        } else if (ProduitUtils.prixSignificativementDifferent(prixAchatBrut, oldPrixAchat, 0.01)) {
            // Le prix d'achat a changé mais pas de nouveau stock
            p.setCoupMoyenAcquisition(prixAchatBrut);
            
            log.info("Mise à jour du prix d'achat du produit existant : {} (CMA: {} → {}, prix brut: {})", 
                    p.getLibelle(), oldCMA, prixAchatBrut, prixAchatBrut);
        } else {
            log.info("Mise à jour des informations du produit existant (sans changement de stock/prix) : {}", 
                    p.getLibelle());
        }
    }
    /**
     * Met à jour les informations du produit
     */
    private void updateProductInfo(Produit p, ProduitRequestDTO dto) {
        p.setCodeProduit(dto.getCodeProduit());  // Mise à jour du code produit
        p.setPrixAchat(dto.getPrixAchat());
        
        // Ne mettre à jour le libellé que s'il a changé
        if (!p.getLibelle().equalsIgnoreCase(dto.getLibelle())) {
            p.setLibelle(dto.getLibelle());
        }
        
        p.setPrixVente(dto.getPrixVente());
        p.setSeuilRuptureStock(dto.getSeuilRuptureStock());
    }

    /**
     * Crée un nouveau produit ou met à jour un existant
     */
    private Produit createNewProduct(ProduitRequestDTO dto, double fraisParUnite) {
        try {
            // Vérifier si le produit existe déjà par libellé
            Optional<Produit> existingProduct = produitService.findByLibelleOnly(dto.getLibelle().trim());
            
            if (existingProduct.isPresent()) {
                // Le produit existe déjà, on le met à jour
                log.info("Produit existant trouvé lors de la création, mise à jour : {} (ID: {}, Code: {})", 
                        existingProduct.get().getLibelle(), existingProduct.get().getId(), existingProduct.get().getCodeProduit());
                
                return updateExistingProduct(existingProduct.get(), dto, fraisParUnite);
            } else {
                // Créer un nouveau produit
                log.info("Création d'un nouveau produit: {}", dto.getLibelle());
                
                Produit p = produitService.saveWithoutAppro(dto, null);
                double nouveauCMA = dto.getPrixAchat() + fraisParUnite;
                nouveauCMA = Math.round(nouveauCMA * 100.0) / 100.0;
                p.setCoupMoyenAcquisition(nouveauCMA);
                p.setPrixAchat(dto.getPrixAchat());
                
                log.info("DEBUG - Avant sauvegarde explicite du nouveau produit: {} (stock: {}, CMA: {})", 
                        p.getLibelle(), p.getStockDisponible(), nouveauCMA);
                
                // Persistance explicite du nouveau produit en utilisant directement le repository
                Produit savedProduit = produitRepository.save(p);
                
                log.info("DEBUG - Après sauvegarde explicite du nouveau produit: {} (ID: {}, stock: {}, CMA: {})", 
                        savedProduit.getLibelle(), savedProduit.getId(), savedProduit.getStockDisponible(), savedProduit.getCoupMoyenAcquisition());
                
                log.info("Nouveau produit créé avec succès: {} (ID: {}, stock: {}, CMA: {})", 
                        savedProduit.getLibelle(), savedProduit.getId(), savedProduit.getStockDisponible(), savedProduit.getCoupMoyenAcquisition());
                
                return savedProduit;
            }
        } catch (Exception e) {
            log.error("Erreur lors de la création/mise à jour du produit {}: {}", dto.getLibelle(), e.getMessage());
            throw new RuntimeException("Erreur lors de la création/mise à jour du produit " + dto.getLibelle(), e);
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

    /**
     * Traite tous les produits avec persistance explicite et verrouillage pour garantir l'ACID
     */
    private List<Produit> processProductsWithLocking(List<ProduitRequestDTO> produitsStandard, double fraisParUnite, Approvisionnement appro) {
        List<Produit> produitsEnregistres = new ArrayList<>();
        
        for (ProduitRequestDTO dto : produitsStandard) {
            try {
                Produit p = processSingleProduit(dto, fraisParUnite);
                int qte = Optional.ofNullable(dto.getStockDisponible()).orElse(0);
                
                if (qte > 0) {
                    approvisionnementService.addExcelDetail(appro, p, qte, dto.getPrixAchat());
                }
                produitsEnregistres.add(p);
                
                log.info("Produit traité avec succès: {} (ID: {}, Stock: {}, CMA: {})", 
                        p.getLibelle(), p.getId(), p.getStockDisponible(), p.getCoupMoyenAcquisition());
                        
            } catch (Exception e) {
                log.error("Erreur lors du traitement du produit {}: {}", dto.getLibelle(), e.getMessage());
                throw new RuntimeException("Erreur lors du traitement du produit " + dto.getLibelle(), e);
            }
        }
        
        return produitsEnregistres;
    }

    /**
     * Vérifie la persistance des données après l'import.
     * Cette méthode est appelée pour s'assurer que les produits créés/mis à jour
     * ont bien été persistés en base après l'import.
     */
    private void verifyDataPersistence(List<Produit> produitsEnregistres) {
        log.info("DEBUG - Vérification de la persistance des données après l'import...");
        
        for (Produit produit : produitsEnregistres) {
            // Re-chercher le produit en base pour vérifier sa présence
            Optional<Produit> foundProduct = produitRepository.findById(produit.getId());
            
            if (foundProduct.isPresent()) {
                log.info("DEBUG - Produit trouvé en base après import: {} (ID: {}, Code: {}, Stock: {}, CMA: {})", 
                        foundProduct.get().getLibelle(), foundProduct.get().getId(), foundProduct.get().getCodeProduit(), 
                        foundProduct.get().getStockDisponible(), foundProduct.get().getCoupMoyenAcquisition());
            } else {
                log.error("DEBUG - Produit non trouvé en base après import: {} (ID: {}, Code: {}, Stock: {}, CMA: {})", 
                        produit.getLibelle(), produit.getId(), produit.getCodeProduit(), 
                        produit.getStockDisponible(), produit.getCoupMoyenAcquisition());
            }
        }
        log.info("DEBUG - Vérification de la persistance des données terminée.");
    }
}