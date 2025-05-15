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

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelApproImportService implements IExcelApproImportService {

    private final IProduitService produitService;
    private final ApprovisionnementService approvisionnementService;
    private final CategorieService categorieService;

    private static final String CODE_PRODUIT_NULL  = "Le code produit est obligatoire";
    private static final String LIBELLE_NULL       = "Le libellé du produit est obligatoire";
    private static final String CATEGORIE_NULL     = "Le nom de la catégorie est obligatoire";
    private static final String STOCK_NEGATIF      = "Le stock disponible ne peut pas être négatif";
    private static final String PRIX_ACHAT_NEGATIF = "Le prix d'achat ne peut pas être négatif";
    private static final String PRODUIT_SUPPRIME   = "Le produit avec le code %s est supprimé";
    private static final String CAT_INTROUVABLE    = "Catégorie non trouvée pour : %s";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importProduitsExcel(List<ProduitRequestDTO> produitsExcel) throws Exception {
        Objects.requireNonNull(produitsExcel, "La liste des produits Excel ne peut pas être nulle");
        if (produitsExcel.isEmpty()) {
            throw new IllegalArgumentException("Le fichier Excel est vide");
        }

        List<String> errors = new ArrayList<>();

        for (int i = 0; i < produitsExcel.size(); i++) {
            ProduitRequestDTO dto = produitsExcel.get(i);
            List<String> rowErrors = new ArrayList<>();

            // 0) Normaliser le nom de la catégorie :
            //    - remplacer NBSP (U+00A0) par espace
            //    - trim et fusionner TOUS les espaces en 1
            if (dto.getCategorieName() != null) {
                String normalized = dto.getCategorieName()
                        .replace('\u00A0', ' ')
                        .trim()
                        .replaceAll("\\s+", " ");
                dto.setCategorieName(normalized);
            }

            // 1) Validations de base
            if (dto.getCodeProduit() == null || dto.getCodeProduit().isBlank()) {
                rowErrors.add(CODE_PRODUIT_NULL);
            }
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

            // 2) Validation de la catégorie (exact, insensible à la casse)
            if (dto.getCategorieName() != null && !dto.getCategorieName().isBlank()) {
                String name = dto.getCategorieName();
                // On retente une recherche "contient" pour en fallback
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
                    rowErrors.add(String.format(CAT_INTROUVABLE, dto.getCategorieName()));
                }
            }

            // 3) Validation du statut (produit supprimé)
            produitService.findByCode(dto.getCodeProduit())
                    .filter(Produit::isDeleted)
                    .ifPresent(p -> rowErrors.add(String.format(PRODUIT_SUPPRIME, dto.getCodeProduit())));

            // Collecte des erreurs de cette ligne
            int finalI = i;
            rowErrors.forEach(msg -> errors.add("Ligne " + (finalI + 1) + " : " + msg));
        }

        // Si des erreurs, on renvoie tout sans persister
        if (!errors.isEmpty()) {
            Map<String, Object> out = new HashMap<>();
            out.put("approvisionnement", null);
            out.put("produitsEnregistres", Collections.emptyList());
            out.put("erreurs", errors);
            return out;
        }

        // 4) Création de l'approvisionnement brouillon
        Approvisionnement appro = approvisionnementService
                .createApprovisionnementExcelBatch(approvisionnementService.generateExcelApproCode());

        // 5) Calculer les frais de transport par unité
        int totalQuantite = produitsExcel.stream()
                .mapToInt(dto -> Optional.ofNullable(dto.getStockDisponible()).orElse(0))
                .sum();
        double fraisTransport = Optional.ofNullable(appro.getFraisTransport()).orElse(0.0);
        double fraisParUnite = totalQuantite > 0 ? fraisTransport / totalQuantite : 0.0;

        // 6) Traitement et détails
        List<Produit> produitsEnregistres = new ArrayList<>();
        for (ProduitRequestDTO dto : produitsExcel) {
            Produit p = processSingleProduit(dto, fraisParUnite);
            int qte = Optional.ofNullable(dto.getStockDisponible()).orElse(0);
            if (qte > 0) {
                approvisionnementService.addExcelDetail(appro, p, qte, dto.getPrixAchat());
            }
            produitsEnregistres.add(p);
        }

        // 7) Finalisation et persistance
        approvisionnementService.finalizeAndSaveApprovisionnement(appro);

        // 8) Préparation de la réponse
        Map<String, Object> out = new HashMap<>();
        out.put("approvisionnement", appro);
        out.put("produitsEnregistres", produitsEnregistres);
        out.put("erreurs", Collections.emptyList());
        return out;
    }

    private Produit processSingleProduit(ProduitRequestDTO dto, double fraisParUnite) throws Exception {
        Optional<Produit> opt = produitService.findByCode(dto.getCodeProduit());
        if (opt.isPresent()) {
            Produit p = opt.get();
            int oldStock = p.getStockDisponible();
            double oldCMA = p.getCoupMoyenAcquisition();
            int newStock = Optional.ofNullable(dto.getStockDisponible()).orElse(0);
            double newPrixAchat = Optional.ofNullable(dto.getPrixAchat()).orElse(0.0) + fraisParUnite;

            // Calcul du coût moyen d'acquisition
            double nouveauCMA = ProduitUtils.calculerCoupMoyenAcquisition(oldStock, oldCMA, newStock, newPrixAchat);
            p.setCoupMoyenAcquisition(nouveauCMA);

            p.setLibelle(dto.getLibelle());
            p.setPrixAchat(dto.getPrixAchat()); // Mettre à jour le dernier prix d'achat
            p.setPrixVente(dto.getPrixVente());
            p.setSeuilRuptureStock(dto.getSeuilRuptureStock());
            p.setStockDisponible(oldStock + newStock);
            return produitService.update(p);
        } else {
            Produit p = produitService.saveWithoutAppro(dto, null);
            double nouveauCMA = dto.getPrixAchat() + fraisParUnite; // Inclure les frais pour nouveaux produits
            nouveauCMA = Math.round(nouveauCMA * 100.0) / 100.0; // Arrondi à 2 décimales
            p.setCoupMoyenAcquisition(nouveauCMA);
            p.setPrixAchat(dto.getPrixAchat()); // Définir le dernier prix d'achat
            return produitService.update(p);
        }
    }
}