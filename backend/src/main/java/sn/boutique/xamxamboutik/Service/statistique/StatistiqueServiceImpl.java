package sn.boutique.xamxamboutik.Service.statistique;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class StatistiqueServiceImpl implements IStatistique {
    private static final Logger logger = LoggerFactory.getLogger(StatistiqueServiceImpl.class);

    @PersistenceContext
    private EntityManager entityManager;

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
        """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        Double result = query.getSingleResult();
        return (result != null) ? result : 0.0;
    }

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
        """;
        TypedQuery<Double> query = entityManager.createQuery(jpql, Double.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        Double result = query.getSingleResult();
        return (result != null) ? result : 0.0;
    }

    @Override
    public LocalDateTime getFirstSaleDate() {
        // Requête temporaire pour inclure toutes les ventes (supprimées ou non) pour débogage
        String jpql = "SELECT MIN(v.date) FROM Vente v";
        TypedQuery<LocalDateTime> query = entityManager.createQuery(jpql, LocalDateTime.class);
        LocalDateTime result = query.getSingleResult();
        logger.info("getFirstSaleDate JPQL: {}, result: {}", jpql, result);
        return result != null ? result : LocalDateTime.now();
    }

    @Override
    public LocalDateTime getLastSaleDate() {
        // Requête temporaire pour inclure toutes les ventes (supprimées ou non) pour débogage
        String jpql = "SELECT MAX(v.date) FROM Vente v";
        TypedQuery<LocalDateTime> query = entityManager.createQuery(jpql, LocalDateTime.class);
        LocalDateTime result = query.getSingleResult();
        logger.info("getLastSaleDate JPQL: {}, result: {}", jpql, result);
        return result != null ? result : LocalDateTime.now();
    }
}