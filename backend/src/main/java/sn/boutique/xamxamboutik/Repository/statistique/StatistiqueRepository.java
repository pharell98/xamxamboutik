package sn.boutique.xamxamboutik.Repository.statistique;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.statistique.Statistique;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface StatistiqueRepository extends SoftDeleteRepository<Statistique, Long> {

    /**
     * Trouve la statistique d'une journée spécifique
     */
    @Query("SELECT s FROM Statistique s WHERE s.date BETWEEN :startOfDay AND :endOfDay AND s.deleted = false")
    Optional<Statistique> findByDateBetween(@Param("startOfDay") LocalDateTime startOfDay, 
                                          @Param("endOfDay") LocalDateTime endOfDay);

    /**
     * Trouve la dernière session de caisse fermée (pour calculer le montant initial)
     */
    @Query("SELECT s FROM Statistique s WHERE s.estCaisseOuverte = false AND s.deleted = false ORDER BY s.date DESC")
    Optional<Statistique> findTopByEstCaisseOuverteFalseOrderByDateDesc();

    /**
     * Trouve la dernière session de caisse ouverte
     */
    @Query("SELECT s FROM Statistique s WHERE s.estCaisseOuverte = true AND s.deleted = false ORDER BY s.date DESC")
    Optional<Statistique> findTopByEstCaisseOuverteTrueOrderByDateDesc();

    /**
     * Trouve toutes les sessions de caisse d'une période donnée
     */
    @Query("SELECT s FROM Statistique s WHERE s.date BETWEEN :startDate AND :endDate AND s.deleted = false ORDER BY s.date DESC")
    java.util.List<Statistique> findSessionsBetween(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Vérifie s'il existe une session de caisse ouverte
     */
    @Query("SELECT COUNT(s) > 0 FROM Statistique s WHERE s.estCaisseOuverte = true AND s.deleted = false")
    boolean existsByEstCaisseOuverteTrue();
}
