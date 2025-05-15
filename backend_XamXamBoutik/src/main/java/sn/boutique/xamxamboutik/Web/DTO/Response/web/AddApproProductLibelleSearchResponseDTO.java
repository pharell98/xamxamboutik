package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddApproProductLibelleSearchResponseDTO {
    @Schema(description = "ID unique du produit a approvisionner", example = "1")
    private Long id;
    @Schema(description = "Libellé du produit a approvisionner", example = "Ordinateur portable")
    private String libelle;
    @Schema(description = "Prix d'achat du produit a approvisionner", example = "500.99")
    private Double prixAchat;
}
