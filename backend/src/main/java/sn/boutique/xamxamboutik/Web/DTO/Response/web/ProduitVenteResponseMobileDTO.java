package sn.boutique.xamxamboutik.Web.DTO.Response.mobile;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ProduitVenteResponseMobileDTO {
    @Schema(description = "ID du produit", example = "1")
    private Long id;
    @Schema(description = "Image associée au produit", example = "image_url.jpg")
    private String image;
    @Schema(description = "Prix de vente", example = "599.99")
    private Double prixVente;
}
