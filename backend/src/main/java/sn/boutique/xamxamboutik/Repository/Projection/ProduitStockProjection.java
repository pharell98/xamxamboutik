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
}
