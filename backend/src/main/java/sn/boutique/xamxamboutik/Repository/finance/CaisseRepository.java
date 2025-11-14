package sn.boutique.xamxamboutik.Repository.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.finance.Caisse;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

@Repository
public interface CaisseRepository extends SoftDeleteRepository<Caisse, Long> {
    Caisse findFirstByOrderByIdAsc();
}
