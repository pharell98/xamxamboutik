package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProduitEchangeResponseDTO {
    private Long id;
    private String libelle;
    private Double prixVente;
}
