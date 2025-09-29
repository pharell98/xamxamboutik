package sn.boutique.xamxamboutik.Repository.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.finance.Caisse;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

@Repository
public interface CaisseRepository extends SoftDeleteRepository<Caisse, Long> {
    
    /**
     * Trouve la caisse principale (il n'y en a qu'une seule)
     */
    Caisse findFirstByOrderByIdAsc();
}
