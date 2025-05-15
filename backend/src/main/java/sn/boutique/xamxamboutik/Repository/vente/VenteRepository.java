package sn.boutique.xamxamboutik.Repository.vente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Repository.Projection.VenteProjection;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;
import java.time.LocalDateTime;

@Repository
public interface VenteRepository extends SoftDeleteRepository<Vente, Long> {
    @Query("""
    SELECT dv.id             AS detailVenteId,
           p.id              AS productId,
           p.libelle         AS libelleProduit,
           p.image           AS imageProduit,
           c.libelle         AS categorieProduit,
           dv.prixVente      AS prixVendu,
           dv.quantiteVendu  AS quantiteVendu,
           pm.modePaiement   AS modePaiement,
           v.date            AS dateVente,
           dv.montantTotal   AS montantTotal,
           dv.status         AS status
    FROM Vente v
    JOIN v.detailVentes dv
    JOIN dv.produit p
    JOIN p.categorie c
    JOIN v.paiement pm
    WHERE v.date >= :startOfDay
      AND v.date < :endOfDay
      AND (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    ORDER BY v.date DESC
    """)
    Page<VenteProjection> findTodaySales(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable
    );

    @Query("""
    SELECT COALESCE(SUM(dv.montantTotal), 0.0) AS totalAmount
    FROM Vente v
    JOIN v.detailVentes dv
    WHERE v.date >= :startOfDay
      AND v.date < :endOfDay
      AND dv.status = 'VENDU'
      AND (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    """)
    Double sumTodaySales(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount
    );

    @Query("""
    SELECT dv.id             AS detailVenteId,
           p.id              AS productId,
           p.libelle         AS libelleProduit,
           p.image           AS imageProduit,
           c.libelle         AS categorieProduit,
           dv.prixVente      AS prixVendu,
           dv.quantiteVendu  AS quantiteVendu,
           pm.modePaiement   AS modePaiement,
           v.date            AS dateVente,
           dv.montantTotal   AS montantTotal,
           dv.status         AS status
    FROM Vente v
    JOIN v.detailVentes dv
    JOIN dv.produit p
    JOIN p.categorie c
    JOIN v.paiement pm
    WHERE v.date >= :startDate
      AND v.date < :endDate
      AND (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    ORDER BY v.date DESC
    """)
    Page<VenteProjection> findSalesBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable
    );

    @Query("""
    SELECT COALESCE(SUM(dv.montantTotal), 0.0) AS totalAmount
    FROM Vente v
    JOIN v.detailVentes dv
    WHERE v.date >= :startDate
      AND v.date < :endDate
      AND dv.status = 'VENDU'
      AND (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    """)
    Double sumSalesBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount
    );

    @Query("""
    SELECT dv.id             AS detailVenteId,
           p.id              AS productId,
           p.libelle         AS libelleProduit,
           p.image           AS imageProduit,
           c.libelle         AS categorieProduit,
           dv.prixVente      AS prixVendu,
           dv.quantiteVendu  AS quantiteVendu,
           pm.modePaiement   AS modePaiement,
           v.date            AS dateVente,
           dv.montantTotal   AS montantTotal,
           dv.status         AS status
    FROM Vente v
    JOIN v.detailVentes dv
    JOIN dv.produit p
    JOIN p.categorie c
    JOIN v.paiement pm
    WHERE (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    ORDER BY v.date DESC
    """)
    Page<VenteProjection> findAllSales(
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            Pageable pageable
    );

    @Query("""
    SELECT COALESCE(SUM(dv.montantTotal), 0.0) AS totalAmount
    FROM Vente v
    JOIN v.detailVentes dv
    WHERE dv.status = 'VENDU'
      AND (:minAmount IS NULL OR dv.montantTotal >= :minAmount)
      AND (:maxAmount IS NULL OR dv.montantTotal <= :maxAmount)
    """)
    Double sumAllSales(
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount
    );
}