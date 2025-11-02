package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Request DTO pour la recherche de produits par libellé")
public class ProduitSearchRequest {
    @Schema(description = "Libellé du produit à rechercher (recherche insensible à la casse, contient le terme)", 
            example = "Ordinateur", required = true)
    private String libelle;
}
