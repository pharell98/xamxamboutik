package sn.boutique.xamxamboutik.Repository.vente;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.vente.Paiement;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;
@Repository
public interface PaiementRepository extends SoftDeleteRepository<Paiement, Long> {
}
