package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesEvolutionDTO {
    private LocalDate date;
    private Double chiffreAffaires;
    private Double benefice;
    private Long nombreVentes;
}

