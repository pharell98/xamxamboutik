package sn.boutique.xamxamboutik.Service.statistique;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.finance.Caisse;
import sn.boutique.xamxamboutik.Entity.statistique.Statistique;
import sn.boutique.xamxamboutik.Repository.finance.CaisseRepository;
import sn.boutique.xamxamboutik.Repository.statistique.StatistiqueRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service interne pour la logique métier pure de la caisse
 * Contient UNIQUEMENT la logique de calcul et de gestion des données
 * AUCUNE exposition API ou formatage de réponse
 * 
 * Principe : Responsabilité unique - Logique métier uniquement
 */
@Service
@Transactional
public class CaisseInternalService {
    private static final Logger logger = LoggerFactory.getLogger(CaisseInternalService.class);

    @Autowired
    private StatistiqueRepository statistiqueRepository;

    @Autowired
    private StatistiqueBusinessService statistiqueBusinessService;

    @Autowired
    private CaisseRepository caisseRepository;

    /**
     * Vérifie si la caisse est ouverte pour la journée actuelle
     * LOGIQUE PURE : Vérification d'état
     */
    public boolean isCaisseOuverte() {
        LocalDate today = LocalDate.now();
        Optional<Statistique> statistiqueToday = statistiqueRepository.findByDateBetween(
            today.atStartOfDay(), 
            today.atTime(23, 59, 59)
        );
        
        return statistiqueToday.map(Statistique::getEstCaisseOuverte).orElse(false);
    }

    /**
     * Ouvre automatiquement la caisse lors de la première vente de la journée
     * LOGIQUE PURE : Calcul et création d'entité
     */
    public void ouvrirCaisseAutomatiquement() {
        LocalDate today = LocalDate.now();
        
        // Vérifier si une caisse est déjà ouverte aujourd'hui
        if (isCaisseOuverte()) {
            logger.debug("Caisse déjà ouverte pour la journée du {}", today);
            return;
        }

        logger.info("Ouverture automatique de la caisse pour la journée du {}", today);

        // Calculer le montant initial intelligent
        double montantInitial = calculerMontantInitialIntelligent();

        // Créer ou mettre à jour la statistique du jour
        Statistique statistique = getOrCreateStatistiqueDuJour(today);
        
        // Configurer l'ouverture de caisse
        statistique.setEstCaisseOuverte(true);
        statistique.setDateOuvertureCaisse(LocalDateTime.now());
        statistique.setMontantCaisseOuverture(montantInitial);
        
        // Initialiser les autres champs si nécessaire
        if (statistique.getVenteJournaliere() == null) {
            statistique.setVenteJournaliere(0.0);
        }
        if (statistique.getPerteJournaliere() == null) {
            statistique.setPerteJournaliere(0.0);
        }

        statistiqueRepository.save(statistique);
        
        logger.info("Caisse ouverte automatiquement avec un montant initial de {} FCFA", montantInitial);
    }

    /**
     * Ferme manuellement la caisse avant 23h59
     * LOGIQUE PURE : Calcul et mise à jour d'entité
     */
    public void fermerCaisseManuellement() {
        LocalDate today = LocalDate.now();
        Optional<Statistique> statistiqueOpt = statistiqueRepository.findByDateBetween(
            today.atStartOfDay(), 
            today.atTime(23, 59, 59)
        );

        if (statistiqueOpt.isEmpty()) {
            logger.warn("Aucune caisse ouverte trouvée pour la fermeture manuelle");
            return;
        }

        Statistique statistique = statistiqueOpt.get();
        
        if (!statistique.getEstCaisseOuverte()) {
            logger.warn("Tentative de fermeture d'une caisse déjà fermée");
            return;
        }

        logger.info("Fermeture manuelle de la caisse pour la journée du {}", today);

        // Calculer le montant théorique (total des ventes de la journée)
        double montantTheorique = calculerMontantTheoriqueJournee(today);
        
        // Enregistrer la fermeture
        statistique.setEstCaisseOuverte(false);
        statistique.setDateFermetureCaisse(LocalDateTime.now());
        statistique.setMontantCaisseFermeture(montantTheorique); // Montant théorique = ventes du jour uniquement
        statistique.setVenteJournaliere(montantTheorique);

        statistiqueRepository.save(statistique);
        
        logger.info("Caisse fermée manuellement - Montant théorique: {} FCFA", montantTheorique);
    }

    /**
     * Ferme automatiquement la caisse à 23h59
     * LOGIQUE PURE : Calcul et mise à jour d'entité
     */
    public void fermerCaisseAutomatiquement() {
        LocalDate today = LocalDate.now();
        Optional<Statistique> statistiqueOpt = statistiqueRepository.findByDateBetween(
            today.atStartOfDay(), 
            today.atTime(23, 59, 59)
        );

        if (statistiqueOpt.isEmpty()) {
            logger.info("Aucune caisse ouverte pour la fermeture automatique du {}", today);
            return;
        }

        Statistique statistique = statistiqueOpt.get();
        
        if (!statistique.getEstCaisseOuverte()) {
            logger.debug("Caisse déjà fermée pour la journée du {}", today);
            return;
        }

        logger.info("Fermeture automatique de la caisse à 23h59 pour la journée du {}", today);

        // Calculer le montant théorique (total des ventes de la journée)
        double montantTheorique = calculerMontantTheoriqueJournee(today);
        
        // Enregistrer la fermeture automatique
        statistique.setEstCaisseOuverte(false);
        statistique.setDateFermetureCaisse(LocalDateTime.now());
        statistique.setMontantCaisseFermeture(montantTheorique); // Montant théorique = ventes du jour uniquement
        statistique.setVenteJournaliere(montantTheorique);

        statistiqueRepository.save(statistique);
        
        logger.info("Caisse fermée automatiquement - Montant théorique: {} FCFA", montantTheorique);
    }

    /**
     * Met à jour les pertes journalières dues aux retours défectueux
     * LOGIQUE PURE : Calcul et mise à jour d'entité
     */
    public void updatePertesJournalieres(LocalDate date, double perte) {
        Optional<Statistique> statistiqueOpt = statistiqueRepository.findByDateBetween(
            date.atStartOfDay(), 
            date.atTime(23, 59, 59)
        );

        if (statistiqueOpt.isPresent()) {
            Statistique statistique = statistiqueOpt.get();
            double perteActuelle = statistique.getPerteJournaliere() != null ? statistique.getPerteJournaliere() : 0.0;
            statistique.setPerteJournaliere(perteActuelle + perte);
            
            // Le montant de fermeture reste uniquement le total des ventes de la journée
            // Les pertes sont enregistrées séparément dans perteJournaliere
            double montantVentesJournee = calculerMontantTheoriqueJournee(date);
            statistique.setMontantCaisseFermeture(montantVentesJournee);
            
            statistiqueRepository.save(statistique);
            
            logger.info("Pertes journalières mises à jour pour le {}: +{} FCFA (Total: {} FCFA)", 
                       date, perte, statistique.getPerteJournaliere());
        }
    }

    /**
     * Met à jour le montant des ventes en temps réel après chaque vente
     * LOGIQUE PURE : Calcul et mise à jour d'entité
     */
    public void updateVentesJournalieresRealtime() {
        LocalDate today = LocalDate.now();
        
        // Vérifier si une caisse est ouverte aujourd'hui
        if (!isCaisseOuverte()) {
            logger.debug("Aucune caisse ouverte pour mettre à jour les ventes en temps réel");
            return;
        }

        // Calculer le montant total des ventes de la journée
        double montantVentesJournee = calculerMontantTheoriqueJournee(today);
        
        // Récupérer la statistique du jour
        Optional<Statistique> statistiqueOpt = statistiqueRepository.findByDateBetween(
            today.atStartOfDay(), 
            today.atTime(23, 59, 59)
        );

        if (statistiqueOpt.isPresent()) {
            Statistique statistique = statistiqueOpt.get();
            
            // Mettre à jour le montant des ventes en temps réel
            statistique.setVenteJournaliere(montantVentesJournee);
            
            // Le montant de fermeture = uniquement le total des ventes de la journée
            statistique.setMontantCaisseFermeture(montantVentesJournee);
            
            statistiqueRepository.save(statistique);
            
            logger.info("Ventes mises à jour en temps réel - Montant ventes: {} FCFA", montantVentesJournee);
        }
    }

    
    /**
     * Récupère le montant total réel de la caisse physique
     * LOGIQUE PURE : Lecture d'entité (read-only)
     */
    public double getMontantTotalCaisseReel() {
        Caisse caisse = caisseRepository.findFirstByOrderByIdAsc();
        return caisse != null ? caisse.getSolde() : 0.0;
    }

    /**
     * Récupère la statistique du jour (si elle existe)
     * LOGIQUE PURE : Lecture d'entité
     */
    public Optional<Statistique> getStatistiqueDuJour(LocalDate date) {
        return statistiqueRepository.findByDateBetween(
            date.atStartOfDay(), 
            date.atTime(23, 59, 59)
        );
    }

    // ========== MÉTHODES PRIVÉES DE CALCUL PUR ==========

    /**
     * Calcule le montant initial intelligent selon la logique définie
     * - 0 FCFA pour nouvelle boutique (première fois)
     * - Montant de fermeture de la veille pour boutique existante
     * LOGIQUE PURE : Calcul métier
     */
    private double calculerMontantInitialIntelligent() {
        // 1) Essayer de baser le montant initial sur le chiffre d'affaires
        //    du DERNIER jour de vente effectivement enregistré
        try {
            LocalDateTime lastSaleDateTime = statistiqueBusinessService.getLastSaleDate();
            if (lastSaleDateTime != null) {
                LocalDate lastSaleDate = lastSaleDateTime.toLocalDate();
                LocalDateTime start = lastSaleDate.atStartOfDay();
                LocalDateTime end = lastSaleDate.atTime(23, 59, 59);
                double revenue = statistiqueBusinessService.getRevenueBetweenDates(start, end);
                logger.debug("Montant initial basé sur la dernière journée de vente ({}): {} FCFA", lastSaleDate, revenue);
                return revenue;
            }
        } catch (Exception e) {
            logger.warn("Impossible de calculer le montant initial via la dernière journée de vente, fallback sur la dernière session fermée", e);
        }

        // 2) Fallback: utiliser la dernière session de caisse fermée si disponible
        Optional<Statistique> derniereSession = statistiqueRepository.findTopByEstCaisseOuverteFalseOrderByDateDesc();
        if (derniereSession.isPresent()) {
            Double montantFermeture = derniereSession.get().getMontantCaisseFermeture();
            double montant = montantFermeture != null ? montantFermeture : 0.0;
            logger.debug("Montant initial (fallback, dernière session fermée): {} FCFA", montant);
            return montant;
        }

        // 3) Nouvelle boutique: 0 FCFA
        logger.debug("Montant initial calculé (nouvelle boutique): 0 FCFA");
        return 0.0;
    }

    /**
     * Calcule le montant théorique de la caisse (total des ventes de la journée)
     * LOGIQUE PURE : Calcul métier
     */
    private double calculerMontantTheoriqueJournee(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        return statistiqueBusinessService.getRevenueBetweenDates(startOfDay, endOfDay);
    }

    /**
     * Récupère ou crée la statistique du jour
     * LOGIQUE PURE : Gestion d'entité
     */
    private Statistique getOrCreateStatistiqueDuJour(LocalDate date) {
        Optional<Statistique> statistiqueOpt = statistiqueRepository.findByDateBetween(
            date.atStartOfDay(), 
            date.atTime(23, 59, 59)
        );

        if (statistiqueOpt.isPresent()) {
            return statistiqueOpt.get();
        } else {
            // Créer une nouvelle statistique pour le jour
            Statistique nouvelleStatistique = new Statistique();
            nouvelleStatistique.setDate(date.atStartOfDay());
            nouvelleStatistique.setEstCaisseOuverte(false);
            return statistiqueRepository.save(nouvelleStatistique);
        }
    }
}
