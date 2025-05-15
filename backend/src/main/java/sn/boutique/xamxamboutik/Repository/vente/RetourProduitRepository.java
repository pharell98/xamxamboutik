package sn.boutique.xamxamboutik.Repository.vente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.vente.RetourProduit;

@Repository
public interface RetourProduitRepository extends JpaRepository<RetourProduit, Long> {
    boolean existsByDetailVenteId(Long detailVenteId);
}