package sn.boutique.xamxamboutik.Repository.Projection;

import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.time.LocalDateTime;

public interface FactureProjection {
    // Informations de base de la vente
    Long getVenteId();

    String getNumeroFacture();

    LocalDateTime getDateVente();

    Double getMontantTotal();

    Double getMontantRestant();

    Boolean getEstCredit();

    // Informations du client
    Long getClientId();

    String getNomClient();

    String getTelephoneClient();

    // Informations du paiement
    Long getPaiementId();

    ModePaiement getModePaiement();

    Double getMontantVerser();

    LocalDateTime getDatePaiement();

    // Informations de l'utilisateur qui a effectué la vente
    Long getUtilisateurId();

    String getUtilisateurNom();
}
