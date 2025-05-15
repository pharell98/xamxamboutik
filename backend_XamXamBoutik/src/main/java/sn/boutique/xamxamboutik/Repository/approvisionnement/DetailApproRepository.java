package sn.boutique.xamxamboutik.Repository.approvisionnement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.approvisionnement.DetailAppro;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

@Repository
public interface DetailApproRepository extends SoftDeleteRepository<DetailAppro, Long> {
    <T> Page<T> findByApprovisionnement_Id(Long approId, Pageable pageable, Class<T> type);
}
