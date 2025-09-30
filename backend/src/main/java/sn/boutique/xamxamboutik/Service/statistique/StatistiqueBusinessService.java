package sn.boutique.xamxamboutik.Service.statistique;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;

import java.time.LocalDateTime;

/**
 * Service métier pour les calculs de statistiques
 * Contient UNIQUEMENT la logique de calcul sans exposition d'API
 * Implémente l'interface IStatistique pour les contrats
 * 
 * Principe : Responsabilité unique - Logique métier uniquement
 */
@Service
public class StatistiqueBusinessService implements IStatistique {
    private static final Logger logger = LoggerFactory.getLogger(StatistiqueBusinessService.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Calcule le bénéfice cumulatif total en excluant les produits retournés/remboursés
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public double getCumulativeBenefit() {
        String jpql = """
                    SELECT COALESCE(
                        SUM((dv.prixVente - p.coupMoyenAcquisition) * dv.quantiteVendu),
                        0
                    )
                    FROM DetailVente dv
                    JOIN dv.produit p
                    JOIN dv.vente v
                    WHERE v.deleted = false
                    AND (
                        dv.status = :statusVendu
                        OR (dv.status = :statusEchange AND dv.montantTotal > 0)
                    )
                """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        query.setParameter("statusVendu", StatusDetailVente.VENDU);
        query.setParameter("statusEchange", StatusDetailVente.RETOURNE_ECHANGE);
        Double result = query.getSingleResult();
        logger.debug("Bénéfice cumulatif calculé: {}", result);
        return (result != null) ? result : 0.0;
    }

    /**
     * Calcule le bénéfice entre deux dates en excluant les produits retournés/remboursés
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public double getBenefitBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        String jpql = """
                    SELECT COALESCE(
                        SUM((dv.prixVente - p.coupMoyenAcquisition) * dv.quantiteVendu),
                        0
                    )
                    FROM DetailVente dv
                    JOIN dv.produit p
                    JOIN dv.vente v
                    WHERE v.date BETWEEN :startDate AND :endDate
                    AND v.deleted = false
                    AND (
                        dv.status = :statusVendu
                        OR (dv.status = :statusEchange AND dv.montantTotal > 0)
                    )
                """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        query.setParameter("statusVendu", StatusDetailVente.VENDU);
        query.setParameter("statusEchange", StatusDetailVente.RETOURNE_ECHANGE);
        Double result = query.getSingleResult();
        logger.debug("Bénéfice calculé entre {} et {}: {}", startDate, endDate, result);
        return (result != null) ? result : 0.0;
    }

    /**
     * Récupère la date de la première vente (non supprimée)
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public LocalDateTime getFirstSaleDate() {
        String jpql = "SELECT MIN(v.date) FROM Vente v WHERE v.deleted = false";
        TypedQuery<LocalDateTime> query = entityManager.createQuery(jpql, LocalDateTime.class);
        LocalDateTime result = query.getSingleResult();
        logger.debug("Date de première vente: {}", result);
        return result != null ? result : LocalDateTime.now();
    }

    /**
     * Récupère la date de la dernière vente (non supprimée)
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public LocalDateTime getLastSaleDate() {
        String jpql = "SELECT MAX(v.date) FROM Vente v WHERE v.deleted = false";
        TypedQuery<LocalDateTime> query = entityManager.createQuery(jpql, LocalDateTime.class);
        LocalDateTime result = query.getSingleResult();
        logger.debug("Date de dernière vente: {}", result);
        return result != null ? result : LocalDateTime.now();
    }

    /**
     * Calcule le chiffre d'affaires total (montants des ventes après retours)
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public double getCumulativeRevenue() {
        String jpql = """
                    SELECT COALESCE(SUM(v.montantTotal), 0)
                    FROM Vente v
                    WHERE v.deleted = false
                """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        Double result = query.getSingleResult();
        logger.debug("Chiffre d'affaires cumulatif calculé: {}", result);
        return (result != null) ? result : 0.0;
    }

    /**
     * Calcule le chiffre d'affaires entre deux dates
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public double getRevenueBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        String jpql = """
                    SELECT COALESCE(SUM(v.montantTotal), 0)
                    FROM Vente v
                    WHERE v.date BETWEEN :startDate AND :endDate
                    AND v.deleted = false
                """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        Double result = query.getSingleResult();
        logger.debug("Chiffre d'affaires calculé entre {} et {}: {}", startDate, endDate, result);
        return (result != null) ? result : 0.0;
    }

    /**
     * Compte le nombre total de ventes effectuées
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public long getTotalSalesCount() {
        String jpql = "SELECT COUNT(v) FROM Vente v WHERE v.deleted = false";
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class);
        Long result = query.getSingleResult();
        logger.debug("Nombre total de ventes: {}", result);
        return (result != null) ? result : 0L;
    }

    /**
     * Compte le nombre de produits vendus (après déduction des retours)
     * LOGIQUE MÉTIER : Calcul pur sans exposition API
     */
    @Override
    public long getTotalProductsSold() {
        String jpql = """
                    SELECT COALESCE(SUM(dv.quantiteVendu), 0)
                    FROM DetailVente dv
                    JOIN dv.vente v
                    WHERE v.deleted = false
                    AND (
                        dv.status = :statusVendu
                        OR (dv.status = :statusEchange AND dv.montantTotal > 0)
                    )
                """;
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class);
        query.setParameter("statusVendu", StatusDetailVente.VENDU);
        query.setParameter("statusEchange", StatusDetailVente.RETOURNE_ECHANGE);
        Long result = query.getSingleResult();
        logger.debug("Nombre total de produits vendus: {}", result);
        return (result != null) ? result : 0L;
    }
}
