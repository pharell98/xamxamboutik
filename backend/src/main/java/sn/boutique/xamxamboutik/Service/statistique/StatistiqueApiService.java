package sn.boutique.xamxamboutik.Service.statistique;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

/**
 * Service API pour l'exposition des statistiques via endpoints
 * Contient UNIQUEMENT la logique d'exposition API et de formatage de réponse
 * Délègue TOUT le calcul métier au StatistiqueBusinessService
 * 
 * Principe : Responsabilité unique - Exposition API uniquement
 */
@Service
public class StatistiqueApiService {
    private static final Logger logger = LoggerFactory.getLogger(StatistiqueApiService.class);

    @Autowired
    private StatistiqueBusinessService statistiqueBusinessService;

    /**
     * Récupère toutes les statistiques cumulatives
     * API LOGIC : Formatage de réponse uniquement
     */
    public Map<String, Object> getAllCumulativeStatistics() {
        logger.info("Récupération de toutes les statistiques cumulatives");
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Délégation pure vers le service métier
            statistics.put("cumulativeBenefit", statistiqueBusinessService.getCumulativeBenefit());
            statistics.put("cumulativeRevenue", statistiqueBusinessService.getCumulativeRevenue());
            statistics.put("totalSalesCount", statistiqueBusinessService.getTotalSalesCount());
            statistics.put("totalProductsSold", statistiqueBusinessService.getTotalProductsSold());
            statistics.put("firstSaleDate", statistiqueBusinessService.getFirstSaleDate());
            statistics.put("lastSaleDate", statistiqueBusinessService.getLastSaleDate());
            
            logger.info("Statistiques cumulatives récupérées avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques cumulatives", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques cumulatives", e);
        }
        
        return statistics;
    }

    /**
     * Récupère les statistiques entre deux dates
     * API LOGIC : Validation API + formatage de réponse
     */
    public Map<String, Object> getStatisticsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Récupération des statistiques entre {} et {}", startDate, endDate);
        
        // Validation API (logique de validation, pas de calcul métier)
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Les dates de début et de fin ne peuvent pas être nulles");
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("La date de début ne peut pas être postérieure à la date de fin");
        }
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Délégation pure vers le service métier
            statistics.put("benefit", statistiqueBusinessService.getBenefitBetweenDates(startDate, endDate));
            statistics.put("revenue", statistiqueBusinessService.getRevenueBetweenDates(startDate, endDate));
            statistics.put("startDate", startDate);
            statistics.put("endDate", endDate);
            
            logger.info("Statistiques entre dates récupérées avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques entre dates", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques entre dates", e);
        }
        
        return statistics;
    }

    /**
     * Récupère les statistiques d'une journée spécifique
     * API LOGIC : Validation API + formatage de réponse
     */
    public Map<String, Object> getDailyStatistics(LocalDateTime date) {
        logger.info("Récupération des statistiques pour la journée du {}", date);
        
        // Validation API (logique de validation, pas de calcul métier)
        if (date == null) {
            throw new IllegalArgumentException("La date ne peut pas être nulle");
        }
        
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = date.toLocalDate().atTime(23, 59, 59);
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Délégation pure vers le service métier
            statistics.put("benefit", statistiqueBusinessService.getBenefitBetweenDates(startOfDay, endOfDay));
            statistics.put("revenue", statistiqueBusinessService.getRevenueBetweenDates(startOfDay, endOfDay));
            statistics.put("date", date.toLocalDate());
            statistics.put("startOfDay", startOfDay);
            statistics.put("endOfDay", endOfDay);
            
            logger.info("Statistiques quotidiennes récupérées avec succès pour le {}", date.toLocalDate());
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques quotidiennes", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques quotidiennes", e);
        }
        
        return statistics;
    }

    /**
     * Récupère les statistiques du mois en cours
     * API LOGIC : Formatage de réponse uniquement
     */
    public Map<String, Object> getCurrentMonthStatistics() {
        logger.info("Récupération des statistiques du mois en cours");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = now.toLocalDate().withDayOfMonth(now.toLocalDate().lengthOfMonth()).atTime(23, 59, 59);
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Délégation pure vers le service métier
            statistics.put("benefit", statistiqueBusinessService.getBenefitBetweenDates(startOfMonth, endOfMonth));
            statistics.put("revenue", statistiqueBusinessService.getRevenueBetweenDates(startOfMonth, endOfMonth));
            statistics.put("month", now.getMonth().name());
            statistics.put("year", now.getYear());
            statistics.put("startOfMonth", startOfMonth);
            statistics.put("endOfMonth", endOfMonth);
            
            logger.info("Statistiques mensuelles récupérées avec succès pour {} {}", now.getYear(), now.getMonth());
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques mensuelles", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques mensuelles", e);
        }
        
        return statistics;
    }

    /**
     * Récupère les statistiques de l'année en cours
     * API LOGIC : Formatage de réponse uniquement
     */
    public Map<String, Object> getCurrentYearStatistics() {
        logger.info("Récupération des statistiques de l'année en cours");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfYear = now.toLocalDate().withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = now.toLocalDate().withDayOfYear(now.toLocalDate().lengthOfYear()).atTime(23, 59, 59);
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Délégation pure vers le service métier
            statistics.put("benefit", statistiqueBusinessService.getBenefitBetweenDates(startOfYear, endOfYear));
            statistics.put("revenue", statistiqueBusinessService.getRevenueBetweenDates(startOfYear, endOfYear));
            statistics.put("year", now.getYear());
            statistics.put("startOfYear", startOfYear);
            statistics.put("endOfYear", endOfYear);
            
            logger.info("Statistiques annuelles récupérées avec succès pour l'année {}", now.getYear());
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques annuelles", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques annuelles", e);
        }
        
        return statistics;
    }
}
