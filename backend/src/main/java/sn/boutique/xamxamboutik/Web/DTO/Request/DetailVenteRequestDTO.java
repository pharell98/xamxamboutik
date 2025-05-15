package sn.boutique.xamxamboutik.Web.DTO.Request;
import lombok.Data;
@Data
public class DetailVenteRequestDTO {
    private Long produitId;
    private Double prixVente;
    private Integer quantiteVendu;
}
