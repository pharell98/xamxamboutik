package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ProduitStockResponseDTO {
    @Schema(description = "ID unique du produit", example = "1")
    private Long id;
    @Schema(description = "Code du produit", example = "PRD12345")
    private String codeProduit;
    @Schema(description = "Image du produit", example = "image_url.jpg")
    private String image;
    @Schema(description = "Libellé du produit", example = "Ordinateur portable")
    private String libelle;
    @Schema(description = "Prix d'achat du produit", example = "500.99")
    private Double prixAchat;
    @Schema(description = "Stock disponible du produit", example = "5")
    private Integer stockDisponible;
}
