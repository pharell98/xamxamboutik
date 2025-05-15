package sn.boutique.xamxamboutik.Repository.base;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;
@NoRepositoryBean
public interface SoftDeleteRepository<T, ID> extends JpaRepository<T, ID> {
    @Modifying
    @Transactional
    @Query("UPDATE #{#entityName} e SET e.deleted = true, e.deletedAt = CURRENT_TIMESTAMP WHERE e.id = ?1")
    void softDelete(ID id);
    @Query("SELECT e FROM #{#entityName} e WHERE e.deleted = false")
    Page<T> findAllActive(Pageable pageable);
    @Query("SELECT e FROM #{#entityName} e WHERE e.deleted = true")
    Page<T> findAllDeleted(Pageable pageable);
    @Modifying
    @Transactional
    @Query("UPDATE #{#entityName} e SET e.deleted = false, e.deletedAt = NULL WHERE e.id = ?1")
    void restore(ID id);
}
