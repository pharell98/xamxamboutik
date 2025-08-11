package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.util.List;

@Data
public class MiniRecuResponseDTO {
    private String numeroFacture;
    private String dateVente;
    private String nomClient;
    private String telephoneClient;
    private ModePaiement modePaiement;
    private List<DetailMiniRecuDTO> detailFacture;
    private Double montantTotal;
    private Double montantPayer;
    private Double montantRestant;
    private String messageFooter;
    private String dateGeneration;
}
