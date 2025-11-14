package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentModeStatDTO {
    private String modePaiement;
    private Double montant;
    private Double pourcentage;
    private Long nombreVentes;
}

