package sn.boutique.xamxamboutik.Web.DTO.Request;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.TypeFacture;

@Data
public class FactureGenerateRequestDTO {
    private Long venteId;
    private TypeFacture typeFacture = TypeFacture.COMPLETE; // COMPLETE ou MINI_RECU
    private Boolean inclureClient = true;
    private Boolean inclureDetails = true;
    private Boolean inclurePaiement = true;
}
