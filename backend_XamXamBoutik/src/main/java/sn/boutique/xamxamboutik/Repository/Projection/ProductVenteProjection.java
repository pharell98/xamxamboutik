package sn.boutique.xamxamboutik.Repository.Projection;
public interface ProductVenteProjection {
    Long getId();
    String getImage();
    String getLibelle();
    Double getPrixVente();
    Double getPrixAchat();
    Integer getStockDisponible();
    CategorieLibelleProjection getCategorie();
}
