package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ProduitResponseWebDTO {
    @Schema(description = "ID unique du produit", example = "1")
    private Long id;
    @Schema(description = "Code unique du produit", example = "PRD12345")
    private String codeProduit;
    @Schema(description = "Image associée au produit", example = "image_url.jpg")
    private String image;
    @Schema(description = "Libellé du produit", example = "Ordinateur portable")
    private String libelle;
    @Schema(description = "Prix de vente du produit", example = "599.99")
    private Double prixVente;
    @Schema(description = "Prix d'achat du produit", example = "500.99")
    private Double prixAchat;
    @Schema(description = "Coût moyen d'acquisition du produit", example = "550.75")
    private Double coupMoyenAcquisition;
    @Schema(description = "Quantité de stock disponible", example = "50")
    private Integer stockDisponible;
    @Schema(description = "Seuil de rupture de stock", example = "10")
    private Integer seuilRuptureStock;
    @Schema(description = "Libellé de la catégorie du produit", example = "Électronique")
    private String categorie;
    @Schema(description = "Indique si le produit est supprimé (soft delete)", example = "false")
    private boolean deleted;
}
