package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ProduitVenteResponseWebDTO {
    @Schema(description = "ID du produit", example = "1")
    private Long id;
    @Schema(description = "Libellé du produit", example = "Ordinateur portable")
    private String libelle;
    @Schema(description = "Image associée au produit", example = "image_url.jpg")
    private String image;
    @Schema(description = "Prix de vente", example = "599.99")
    private Double prixVente;
    @Schema(description = "Prix d'achat", example = "500.99")
    private Double prixAchat;
    @Schema(description = "Stock disponible", example = "100")
    private Integer stockDisponible;
    @Schema(description = "Libellé de la catégorie", example = "Électronique")
    private String categorieLibelle;
}
