package sn.boutique.xamxamboutik.Service.statistique;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Enums.ModePaiement;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AverageBasketDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.PaymentModeStatDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.SalesEvolutionDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service métier pour les statistiques avancées du dashboard
 * Contient les calculs pour KPIs, répartition paiements, évolution CA, etc.
 */
@Service
public class DashboardStatistiqueService {
    private static final Logger logger = LoggerFactory.getLogger(DashboardStatistiqueService.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private StatistiqueBusinessService statistiqueBusinessService;

    /**
     * Calcule la répartition des ventes par mode de paiement pour une période donnée
     */
    public List<PaymentModeStatDTO> getVentesByPaymentMode(LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Calcul de la répartition des ventes par mode de paiement entre {} et {}", startDate, endDate);

        List<PaymentModeStatDTO> result = new ArrayList<>();
        double totalMontant = statistiqueBusinessService.getRevenueBetweenDates(startDate, endDate);

        // Pour chaque mode de paiement, calculer le montant et le pourcentage
        for (ModePaiement mode : ModePaiement.values()) {
            String jpql = """
                    SELECT COALESCE(SUM(v.montantTotal), 0.0), COUNT(v)
                    FROM Vente v
                    JOIN v.paiements p
                    WHERE v.date BETWEEN :startDate AND :endDate
                    AND v.deleted = false
                    AND p.modePaiement = :modePaiement
                    """;

            TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);
            query.setParameter("modePaiement", mode);

            Object[] queryResult = query.getSingleResult();
            Double montant = (Double) queryResult[0];
            Long nombreVentes = (Long) queryResult[1];

            if (montant != null && montant > 0) {
                double pourcentage = totalMontant > 0 ? (montant / totalMontant) * 100 : 0.0;
                result.add(new PaymentModeStatDTO(
                        mode.getKey(),
                        montant,
                        Math.round(pourcentage * 100.0) / 100.0, // Arrondir à 2 décimales
                        nombreVentes
                ));
            }
        }

        logger.debug("Répartition par mode de paiement calculée: {} modes trouvés", result.size());
        return result;
    }

    /**
     * Calcule le panier moyen pour une période donnée
     */
    public AverageBasketDTO getAverageBasket(LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Calcul du panier moyen entre {} et {}", startDate, endDate);

        double montantTotal = statistiqueBusinessService.getRevenueBetweenDates(startDate, endDate);
        long nombreVentes = statistiqueBusinessService.getSalesCountBetweenDates(startDate, endDate);

        double panierMoyen = nombreVentes > 0 ? montantTotal / nombreVentes : 0.0;

        logger.debug("Panier moyen calculé: {} FCFA pour {} ventes", panierMoyen, nombreVentes);
        return new AverageBasketDTO(
                Math.round(panierMoyen * 100.0) / 100.0, // Arrondir à 2 décimales
                nombreVentes,
                montantTotal
        );
    }

    /**
     * Récupère l'évolution du CA jour par jour pour les N derniers jours
     */
    public List<SalesEvolutionDTO> getSalesEvolution(int numberOfDays) {
        logger.debug("Récupération de l'évolution des ventes sur {} jours", numberOfDays);

        List<SalesEvolutionDTO> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = numberOfDays - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);

            double ca = statistiqueBusinessService.getRevenueBetweenDates(startOfDay, endOfDay);
            double benefice = statistiqueBusinessService.getBenefitBetweenDates(startOfDay, endOfDay);
            long nombreVentes = statistiqueBusinessService.getSalesCountBetweenDates(startOfDay, endOfDay);

            result.add(new SalesEvolutionDTO(date, ca, benefice, nombreVentes));
        }

        logger.debug("Évolution des ventes calculée pour {} jours", numberOfDays);
        return result;
    }

    /**
     * Compte le nombre de produits en rupture de stock
     */
    public long countProduitsEnRupture() {
        logger.debug("Comptage des produits en rupture de stock");

        String jpql = """
                SELECT COUNT(p) FROM Produit p
                WHERE p.deleted = false
                AND (
                    p.stockDisponible = 0
                    OR (p.seuilRuptureStock IS NOT NULL AND p.stockDisponible <= p.seuilRuptureStock)
                )
                """;

        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class);
        Long result = query.getSingleResult();

        logger.debug("Nombre de produits en rupture: {}", result);
        return (result != null) ? result : 0L;
    }

    /**
     * Compte le nombre de produits en alerte critique (stock <= seuil / 2)
     */
    public long countProduitsAlerteCritique() {
        logger.debug("Comptage des produits en alerte critique");

        String jpql = """
                SELECT COUNT(p) FROM Produit p
                WHERE p.deleted = false
                AND p.seuilRuptureStock IS NOT NULL
                AND p.stockDisponible > 0
                AND p.stockDisponible <= (p.seuilRuptureStock / 2)
                """;

        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class);
        Long result = query.getSingleResult();

        logger.debug("Nombre de produits en alerte critique: {}", result);
        return (result != null) ? result : 0L;
    }

    /**
     * Calcule le taux de retour/échange pour une période donnée
     */
    public double getTauxRetour(LocalDateTime startDate, LocalDateTime endDate) {
        logger.debug("Calcul du taux de retour entre {} et {}", startDate, endDate);

        // Nombre total de ventes
        long totalVentes = statistiqueBusinessService.getSalesCountBetweenDates(startDate, endDate);

        if (totalVentes == 0) {
            return 0.0;
        }

        // Nombre de retours/échanges
        String jpql = """
                SELECT COUNT(DISTINCT dv.vente.id)
                FROM DetailVente dv
                JOIN dv.vente v
                WHERE v.date BETWEEN :startDate AND :endDate
                AND v.deleted = false
                AND (dv.status = :statusRetourneRembourse OR dv.status = :statusRetourneEchange)
                """;

        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        query.setParameter("statusRetourneRembourse", StatusDetailVente.RETOURNE_REMBOURSE);
        query.setParameter("statusRetourneEchange", StatusDetailVente.RETOURNE_ECHANGE);

        Long nombreRetours = query.getSingleResult();
        nombreRetours = (nombreRetours != null) ? nombreRetours : 0L;

        double tauxRetour = (nombreRetours * 100.0) / totalVentes;

        logger.debug("Taux de retour calculé: {}% ({} retours sur {} ventes)", tauxRetour, nombreRetours, totalVentes);
        return Math.round(tauxRetour * 100.0) / 100.0; // Arrondir à 2 décimales
    }
}

