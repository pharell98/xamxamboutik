package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * DTO pour l'import Excel d'approvisionnement
 * 
 * Format attendu dans le fichier Excel :
 * | code produit | libelle | prix achat | prix vente | stock disponible | seuil rupture stock | categorie produit | image url |
 * 
 * Exemple de données :
 * |              | style legend | 0 | 10 | 10 | 0 | style | https://example.com/style-legend.jpg |
 * |              | style glamour | 0 | 10 | 10 | 0 | style | https://example.com/style-glamour.jpg |
 */
@Data
@Schema(description = "DTO pour l'import Excel d'approvisionnement")
public class ApprovisionnementExcelRequestDTO {
    
    @Schema(description = "Code du produit (optionnel, sera généré automatiquement si vide)", example = "STYLE-LEGEND-001")
    private String codeProduit;
    
    @Schema(description = "Nom/description du produit (obligatoire)", example = "style legend", required = true)
    private String libelle;
    
    @Schema(description = "Prix d'achat du produit (obligatoire)", example = "0.0", required = true)
    private Double prixAchat;
    
    @Schema(description = "Prix de vente du produit (obligatoire)", example = "10.0", required = true)
    private Double prixVente;
    
    @Schema(description = "Quantité en stock (obligatoire)", example = "10", required = true)
    private Integer stockDisponible;
    
    @Schema(description = "Seuil d'alerte de rupture de stock (obligatoire)", example = "0", required = true)
    private Integer seuilRuptureStock;
    
    @Schema(description = "Catégorie du produit (obligatoire)", example = "style", required = true)
    private String categorieProduit;
    
    @Schema(description = "URL de l'image du produit (optionnel)", example = "https://example.com/style-legend.jpg")
    private String imageURL;
    
    // Champs additionnels pour la compatibilité avec le système existant
    @Schema(description = "Nom de la catégorie (utilisé pour la recherche)", example = "style")
    private String categorieName;
    
    @Schema(description = "ID de la catégorie (rempli automatiquement)", example = "1")
    private Long categorieId;
    
    @Schema(description = "Indique si l'image doit être utilisée via URL", example = "true")
    private Boolean useImageURL;
    
    @Schema(description = "ID du produit (pour la mise à jour)", example = "1")
    private Long id;
} 