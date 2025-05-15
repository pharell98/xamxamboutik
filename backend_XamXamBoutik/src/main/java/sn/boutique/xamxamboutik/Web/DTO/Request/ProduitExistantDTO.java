package sn.boutique.xamxamboutik.Web.DTO.Request;
import lombok.Data;
@Data
public class ProduitExistantDTO {
    private String id;
    private String libelle;
    private Integer quantite;
    private Double prixAchat;
}
