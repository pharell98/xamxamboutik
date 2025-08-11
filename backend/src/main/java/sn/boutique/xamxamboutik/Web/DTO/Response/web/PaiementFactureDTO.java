package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.time.LocalDateTime;

@Data
public class PaiementFactureDTO {
    private ModePaiement modePaiement;
    private Double montantVerser;
    private LocalDateTime datePaiement;
}
