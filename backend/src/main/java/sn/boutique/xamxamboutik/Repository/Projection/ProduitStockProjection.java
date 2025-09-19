package sn.boutique.xamxamboutik.Repository.Projection;

import org.springframework.beans.factory.annotation.Value;

public interface ProduitStockProjection {
    Long getId();

    String getCodeProduit();

    String getImage();

    String getLibelle();

    Double getPrixAchat();

    @Value("#{target.stockDisponible}")
    Integer getStockDisponible();

    @Value("#{target.seuilRuptureStock}")
    Integer getSeuilRuptureStock();

    // Méthode calculée pour déterminer le niveau d'urgence
    @Value("#{target.stockDisponible == 0 ? 'RUPTURE_TOTALE' : " +
           "(target.seuilRuptureStock != null and target.stockDisponible <= target.seuilRuptureStock / 2 ? 'CRITIQUE' : " +
           "(target.seuilRuptureStock != null and target.stockDisponible <= target.seuilRuptureStock ? 'FAIBLE' : 'STOCK_ZERO'))}")
    String getNiveauUrgence();
}
