package sn.boutique.xamxamboutik.Repository.Projection;

public interface ProduitProjection {
    Long getId();
    String getCodeProduit();
    String getImage();
    String getLibelle();
    Double getPrixVente();
    Double getPrixAchat();
    Double getCoupMoyenAcquisition();
    Integer getStockDisponible();
    Integer getSeuilRuptureStock();
    CategorieLibelleProjection getCategorie();
    boolean isDeleted(); // Ajouté pour inclure la propriété deleted
}