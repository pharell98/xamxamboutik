package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AverageBasketDTO {
    private Double panierMoyen;
    private Long nombreVentes;
    private Double montantTotal;
}

