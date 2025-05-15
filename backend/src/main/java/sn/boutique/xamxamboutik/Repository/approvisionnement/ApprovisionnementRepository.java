package sn.boutique.xamxamboutik.Repository.approvisionnement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;
@Repository
public interface ApprovisionnementRepository extends SoftDeleteRepository<Approvisionnement, Long> {
    <T> Page<T> findAllProjectedByOrderByDateDesc(Pageable pageable, Class<T> type);
    boolean existsByCodeAppro(String codeAppro);
}