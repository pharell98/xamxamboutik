package sn.boutique.xamxamboutik.Repository.vente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Repository.Projection.DetailFactureProjection;
import sn.boutique.xamxamboutik.Repository.Projection.FactureProjection;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository extends SoftDeleteRepository<sn.boutique.xamxamboutik.Entity.vente.Vente, Long> {
    
    @Query("SELECT v.numeroFacture FROM Vente v WHERE v.numeroFacture LIKE :prefix% ORDER BY v.numeroFacture DESC LIMIT 1")
    Optional<String> findLastNumeroFactureByPrefix(@Param("prefix") String prefix);
    
    /**
     * Récupère une facture complète par son numéro
     */
    @Query("""
        SELECT 
            v.id AS venteId,
            v.numeroFacture AS numeroFacture,
            v.date AS dateVente,
            v.montantTotal AS montantTotal,
            v.montantRestant AS montantRestant,
            v.estCredit AS estCredit,
            c.id AS clientId,
            c.nomComplet AS nomClient,
            c.telephone AS telephoneClient,
            p.id AS paiementId,
            p.modePaiement AS modePaiement,
            p.montantVerser AS montantVerser,
            p.datePaiement AS datePaiement
        FROM Vente v
        LEFT JOIN v.client c
        LEFT JOIN v.paiement p
        WHERE v.numeroFacture = :numeroFacture
        AND v.deleted = false
        """)
    Optional<FactureProjection> findFactureByNumero(@Param("numeroFacture") String numeroFacture);
    
    /**
     * Récupère une facture par ID de vente
     */
    @Query("""
        SELECT 
            v.id AS venteId,
            v.numeroFacture AS numeroFacture,
            v.date AS dateVente,
            v.montantTotal AS montantTotal,
            v.montantRestant AS montantRestant,
            v.estCredit AS estCredit,
            c.id AS clientId,
            c.nomComplet AS nomClient,
            c.telephone AS telephoneClient,
            p.id AS paiementId,
            p.modePaiement AS modePaiement,
            p.montantVerser AS montantVerser,
            p.datePaiement AS datePaiement
        FROM Vente v
        LEFT JOIN v.client c
        LEFT JOIN v.paiement p
        WHERE v.id = :venteId
        AND v.deleted = false
        """)
    Optional<FactureProjection> findFactureByVenteId(@Param("venteId") Long venteId);
    
    /**
     * Récupère les détails des produits d'une vente
     */
    @Query("""
        SELECT 
            dv.id AS detailVenteId,
            p.libelle AS libelleProduit,
            dv.quantiteVendu AS quantiteVendu,
            dv.prixVente AS prixVente,
            dv.montantTotal AS montantTotal,
            dv.status AS status,
            p.id AS produitId,
            v.id AS venteId
        FROM DetailVente dv
        JOIN dv.vente v
        JOIN dv.produit p
        WHERE v.id = :venteId
        AND v.deleted = false
        """)
    List<DetailFactureProjection> findDetailVentesByVenteId(@Param("venteId") Long venteId);
    
    /**
     * Recherche de factures avec filtres avancés
     */
    @Query("""
        SELECT 
            v.id AS venteId,
            v.numeroFacture AS numeroFacture,
            v.date AS dateVente,
            v.montantTotal AS montantTotal,
            v.montantRestant AS montantRestant,
            v.estCredit AS estCredit,
            c.id AS clientId,
            c.nomComplet AS nomClient,
            c.telephone AS telephoneClient,
            p.id AS paiementId,
            p.modePaiement AS modePaiement,
            p.montantVerser AS montantVerser,
            p.datePaiement AS datePaiement
        FROM Vente v
        LEFT JOIN v.client c
        LEFT JOIN v.paiement p
        WHERE v.deleted = false
        AND (:numeroFacture IS NULL OR v.numeroFacture LIKE %:numeroFacture%)
        AND (:dateDebut IS NULL OR v.date >= :dateDebut)
        AND (:dateFin IS NULL OR v.date < :dateFin)
        AND (:nomClient IS NULL OR c.nomComplet LIKE %:nomClient%)
        AND (:telephoneClient IS NULL OR c.telephone LIKE %:telephoneClient%)
        AND (:modePaiement IS NULL OR p.modePaiement = :modePaiement)
        AND (:estCredit IS NULL OR v.estCredit = :estCredit)
        AND (:montantMin IS NULL OR v.montantTotal >= :montantMin)
        AND (:montantMax IS NULL OR v.montantTotal <= :montantMax)
        ORDER BY v.date DESC
        """)
    Page<FactureProjection> searchFactures(
            @Param("numeroFacture") String numeroFacture,
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin,
            @Param("nomClient") String nomClient,
            @Param("telephoneClient") String telephoneClient,
            @Param("modePaiement") String modePaiement,
            @Param("estCredit") Boolean estCredit,
            @Param("montantMin") Double montantMin,
            @Param("montantMax") Double montantMax,
            Pageable pageable
    );
    
    /**
     * Récupère toutes les ventes avec pagination
     */
    @Query("""
        SELECT 
            v.id AS venteId,
            v.numeroFacture AS numeroFacture,
            v.date AS dateVente,
            v.montantTotal AS montantTotal,
            v.montantRestant AS montantRestant,
            v.estCredit AS estCredit,
            c.id AS clientId,
            c.nomComplet AS nomClient,
            c.telephone AS telephoneClient,
            p.id AS paiementId,
            p.modePaiement AS modePaiement,
            p.montantVerser AS montantVerser,
            p.datePaiement AS datePaiement
        FROM Vente v
        LEFT JOIN v.client c
        LEFT JOIN v.paiement p
        WHERE v.deleted = false
        ORDER BY v.date DESC
        """)
    Page<FactureProjection> findAllFactures(Pageable pageable);
    
    /**
     * Récupère toutes les ventes avec leurs détails produits
     */
    @Query("""
        SELECT DISTINCT
            v.id AS venteId,
            v.numeroFacture AS numeroFacture,
            v.date AS dateVente,
            v.montantTotal AS montantTotal,
            v.montantRestant AS montantRestant,
            v.estCredit AS estCredit,
            c.id AS clientId,
            c.nomComplet AS nomClient,
            c.telephone AS telephoneClient,
            p.id AS paiementId,
            p.modePaiement AS modePaiement,
            p.montantVerser AS montantVerser,
            p.datePaiement AS datePaiement
        FROM Vente v
        LEFT JOIN v.client c
        LEFT JOIN v.paiement p
        LEFT JOIN v.detailVentes dv
        WHERE v.deleted = false
        ORDER BY v.date DESC
        """)
    Page<FactureProjection> findAllFacturesWithDetails(Pageable pageable);
    
    /**
     * Vérifie si un numéro de facture existe
     */
    @Query("SELECT COUNT(v) > 0 FROM Vente v WHERE v.numeroFacture = :numeroFacture AND v.deleted = false")
    boolean existsByNumeroFacture(@Param("numeroFacture") String numeroFacture);
}
