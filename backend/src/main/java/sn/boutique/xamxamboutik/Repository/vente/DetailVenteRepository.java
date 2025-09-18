package sn.boutique.xamxamboutik.Repository.vente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.vente.DetailVente;

@Repository
public interface DetailVenteRepository extends JpaRepository<DetailVente, Long> {
    // Toutes les méthodes nécessaires sont héritées de JpaRepository
}