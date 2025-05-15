package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.Data;
import sn.boutique.xamxamboutik.Enums.ModePaiement;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;

@Data
public class VenteJourResponseDTO {
    private Long detailVenteId; // Ajouté pour correspondre à l'ID de DetailVente
    private Long productId;
    private String libelleProduit;
    private String imageProduit;
    private String categorieProduit;
    private Double prixVendu;
    private Integer quantiteVendu;
    private ModePaiement modePaiement;
    private String dateVente;
    private Double montantTotal;
    private StatusDetailVente status;
}