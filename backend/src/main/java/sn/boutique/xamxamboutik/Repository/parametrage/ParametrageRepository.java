package sn.boutique.xamxamboutik.Repository.parametrage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.parametrage.Parametrage;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;

import java.util.Optional;

@Repository
public interface ParametrageRepository extends JpaRepository<Parametrage, Long> {

    @Query("SELECT p FROM Parametrage p WHERE p.deleted = false")
    Optional<Parametrage> findActiveParametrage();

    @Query("SELECT p FROM Parametrage p WHERE p.deleted = false")
    Optional<ParametrageProjection> findActiveParametrageProjection();

    boolean existsByDeletedFalse();
}