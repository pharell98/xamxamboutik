package sn.boutique.xamxamboutik.Repository.Projection;

import sn.boutique.xamxamboutik.Enums.ModePaiement;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;
import java.time.LocalDateTime;

public interface VenteProjection {
    Long getDetailVenteId(); // Ajouté pour retourner l'ID de DetailVente
    Long getProductId();
    String getLibelleProduit();
    String getImageProduit();
    String getCategorieProduit();
    Double getPrixVendu();
    Integer getQuantiteVendu();
    ModePaiement getModePaiement();
    LocalDateTime getDateVente();
    Double getMontantTotal();
    StatusDetailVente getStatus();
}