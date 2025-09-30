package sn.boutique.xamxamboutik.Service.statistique;

import java.time.LocalDateTime;

/**
 * Interface pour les services de statistiques
 * Définit les contrats pour les calculs statistiques
 */
public interface IStatistique {
    /**
     * Calcule le bénéfice cumulatif total en excluant les produits retournés/remboursés
     */
    double getCumulativeBenefit();

    /**
     * Calcule le bénéfice entre deux dates en excluant les produits retournés/remboursés
     */
    double getBenefitBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Récupère la date de la première vente (non supprimée)
     */
    LocalDateTime getFirstSaleDate();

    /**
     * Récupère la date de la dernière vente (non supprimée)
     */
    LocalDateTime getLastSaleDate();

    /**
     * Calcule le chiffre d'affaires total (montants des ventes après retours)
     */
    double getCumulativeRevenue();

    /**
     * Calcule le chiffre d'affaires entre deux dates
     */
    double getRevenueBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Compte le nombre total de ventes effectuées
     */
    long getTotalSalesCount();

    /**
     * Compte le nombre de produits vendus (après déduction des retours)
     */
    long getTotalProductsSold();
}
