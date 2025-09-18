package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FactureSummaryDTO {
    private String numeroFacture;
    private LocalDateTime dateVente;
    private String nomClient;
    private String telephoneClient;
    private ModePaiement modePaiement;
    private Double montantTotal;
    private Double montantPayer;
    private Double montantRestant;
    private Boolean estCredit;
    private List<DetailFactureDTO> detailFacture;
    private Long utilisateurId;
    private String utilisateurNom;
}
