package sn.boutique.xamxamboutik.Web.DTO.Request;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.time.LocalDate;

@Data
public class FactureSearchRequestDTO {
    private String numeroFacture;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String nomClient;
    private String telephoneClient;
    private ModePaiement modePaiement;
    private Boolean estCredit;
    private Double montantMin;
    private Double montantMax;
    private Integer page = 0;
    private Integer size = 20;
}
