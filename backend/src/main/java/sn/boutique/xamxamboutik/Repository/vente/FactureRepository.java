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
                p.datePaiement AS datePaiement,
                u.id AS utilisateurId,
                u.nom AS utilisateurNom
            FROM Vente v
            LEFT JOIN v.client c
            LEFT JOIN v.paiements p
            LEFT JOIN v.utilisateur u
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
                p.datePaiement AS datePaiement,
                u.id AS utilisateurId,
                u.nom AS utilisateurNom
            FROM Vente v
            LEFT JOIN v.client c
            LEFT JOIN v.paiements p
            LEFT JOIN v.utilisateur u
            WHERE v.id = :venteId
            AND v.deleted = false
            """)
    Optional<FactureProjection> findFactureByVenteId(@Param("venteId") Long venteId);

    /**
     * Récupère les détails des produits d'une vente pour affichage facture
     * LOGIQUE: Affiche les produits actuellement valides dans la facture
     * - VENDU: produits vendus normalement
     * - RETOURNE_ECHANGE avec montantTotal > 0: nouveaux produits d'échange
     * EXCLUT: 
     * - RETOURNE_REMBOURSE: produits remboursés
     * - RETOURNE_ECHANGE avec montantTotal = 0: anciens produits échangés
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
            AND (
                dv.status = 'VENDU' 
                OR (dv.status = 'RETOURNE_ECHANGE' AND dv.montantTotal > 0)
            )
            ORDER BY dv.id ASC
            """)
    List<DetailFactureProjection> findDetailVentesByVenteId(@Param("venteId") Long venteId);


    /**
     * Récupère les détails pour facture en excluant les produits défectueux retournés
     * LOGIQUE SPÉCIALE: Exclut complètement les produits défectueux des factures
     * - VENDU: produits vendus normalement
     * - RETOURNE_ECHANGE avec montantTotal > 0: nouveaux produits d'échange (non défectueux)
     * EXCLUT COMPLÈTEMENT:
     * - Tous les produits liés à des retours défectueux (REMBOURSEMENT_DEFECTUEUX, ECHANGE_DEFECTUEUX)
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
            LEFT JOIN RetourProduit rp ON rp.detailVente.id = dv.id
            WHERE v.id = :venteId
            AND v.deleted = false
            AND (
                (dv.status = 'VENDU' AND (rp.id IS NULL OR rp.typeRetour NOT IN ('REMBOURSEMENT_DEFECTUEUX', 'ECHANGE_DEFECTUEUX')))
                OR (dv.status = 'RETOURNE_ECHANGE' AND dv.montantTotal > 0)
            )
            ORDER BY dv.id ASC
            """)
    List<DetailFactureProjection> findDetailVentesForFactureExcludingDefective(@Param("venteId") Long venteId);



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
                p.datePaiement AS datePaiement,
                u.id AS utilisateurId,
                u.nom AS utilisateurNom
            FROM Vente v
            LEFT JOIN v.client c
            LEFT JOIN v.paiements p
            LEFT JOIN v.utilisateur u
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

    /**
     * Récupère les factures dans une plage de dates
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
                p.datePaiement AS datePaiement,
                u.id AS utilisateurId,
                u.nom AS utilisateurNom
            FROM Vente v
            LEFT JOIN v.client c
            LEFT JOIN v.paiements p
            LEFT JOIN v.utilisateur u
            WHERE v.deleted = false
            AND v.date >= :dateDebut
            AND v.date < :dateFin
            ORDER BY v.date DESC
            """)
    Page<FactureProjection> findFacturesByDateRange(
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin,
            Pageable pageable
    );
}
