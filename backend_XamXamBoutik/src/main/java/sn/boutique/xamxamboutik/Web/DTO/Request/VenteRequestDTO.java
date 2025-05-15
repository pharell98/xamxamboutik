package sn.boutique.xamxamboutik.Web.DTO.Request;
import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;
import java.util.List;
@Data
public class VenteRequestDTO {
    private List<DetailVenteRequestDTO> detailVenteList;
    private ModePaiement modePaiement;
    private Double montantTotal;
}