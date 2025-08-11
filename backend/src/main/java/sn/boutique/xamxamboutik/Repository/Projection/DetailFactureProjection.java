package sn.boutique.xamxamboutik.Repository.Projection;

import sn.boutique.xamxamboutik.Enums.StatusDetailVente;

public interface DetailFactureProjection {
    Long getDetailVenteId();
    String getLibelleProduit();
    Integer getQuantiteVendu();
    Double getPrixVente();
    Double getMontantTotal();
    StatusDetailVente getStatus();
    Long getProduitId();
    Long getVenteId();
}
