package sn.boutique.xamxamboutik.Repository.Projection;
import org.springframework.beans.factory.annotation.Value;
public interface ApprovisionnementProductProjection {
    @Value("#{target.produit.codeProduit}")
    String getCodeProduit();
    @Value("#{target.produit.libelle}")
    String getLibelle();
    Double getPrixAchat();
    Integer getQuantiteAchat();
    default Double getMontantTotal() {
        Double prix = getPrixAchat();
        Integer quantite = getQuantiteAchat();
        return (prix != null && quantite != null) ? prix * quantite : null;
    }
}
