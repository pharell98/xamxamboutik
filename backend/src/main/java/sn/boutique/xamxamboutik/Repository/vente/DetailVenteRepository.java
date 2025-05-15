package sn.boutique.xamxamboutik.Repository.vente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.vente.DetailVente;

import java.util.Optional;

@Repository
public interface DetailVenteRepository extends JpaRepository<DetailVente, Long> {
    Optional<DetailVente> findByIdAndVenteId(Long id, Long venteId);
}