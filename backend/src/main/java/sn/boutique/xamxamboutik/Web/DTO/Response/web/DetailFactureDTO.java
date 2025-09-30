package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;

@Data
public class DetailFactureDTO {
    private String libelle;
    private Integer quantite;
    private Double prix;
    private Double montantTotal;
}
