package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ApprovisionnementProductDTO {
    @Schema(description = "Code du produit", example = "PROD-001")
    private String codeProduit;
    @Schema(description = "Libellé du produit", example = "Nom du produit")
    private String libelle;
    @Schema(description = "Prix d'achat issu du détail approvisionnement", example = "10.0")
    private Double prixAchat;
    @Schema(description = "Quantité d'achat issu du détail approvisionnement", example = "5")
    private Integer quantiteAchat;
    @Schema(description = "Montant total par produit (prix d'achat * quantité)", example = "50.0")
    private Double montantTotal;
}
