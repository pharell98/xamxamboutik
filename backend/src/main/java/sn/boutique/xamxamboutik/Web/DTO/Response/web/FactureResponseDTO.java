package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;

import java.util.List;

@Data
public class FactureResponseDTO {
    private String numeroFacture;
    private String dateVenteFormatted;
    private ClientFactureDTO client;
    private PaiementFactureDTO paiement;
    private List<DetailFactureDTO> detailFacture;
    private Double montantTotal;
    private Double montantPayer;
    private Double montantRestant;
    private Boolean estCredit;
    private String dateGeneration;
    private Long utilisateurId;
    private String utilisateurNom;
}
