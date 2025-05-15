package sn.boutique.xamxamboutik.Web.DTO.Request;
import lombok.Data;
import java.util.List;
@Data
public class ApprovisionnementRequestDTO {
    private String codeAppro;       // ex: "APPRO-2025-0001"
    private Double fraisTransport;  // ex. 100
    private Double montantTotal;    // ex. 10228 (déjà calculé côté front)
    private List<ProduitExistantDTO> produitExitant;
    private List<ProduitRequestDTO> newproduit;
}
