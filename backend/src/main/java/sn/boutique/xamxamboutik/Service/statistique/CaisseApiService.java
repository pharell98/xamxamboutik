package sn.boutique.xamxamboutik.Service.statistique;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.statistique.Statistique;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service API pour l'exposition des fonctionnalités de caisse
 * Contient UNIQUEMENT la logique d'exposition API et de formatage de réponse
 * Délègue TOUT le calcul métier au CaisseInternalService
 * 
 * Principe : Responsabilité unique - Exposition API uniquement
 */
@Service
public class CaisseApiService {
    private static final Logger logger = LoggerFactory.getLogger(CaisseApiService.class);

    @Autowired
    private CaisseInternalService caisseInternalService;

    /**
     * Récupère l'état actuel de la caisse formaté pour l'API
     * API LOGIC : Formatage de réponse uniquement
     */
    public Map<String, Object> getCaisseEtat() {
        logger.debug("Récupération de l'état de la caisse pour l'API");
        
        LocalDate today = LocalDate.now();
        Optional<Statistique> statistiqueOpt = caisseInternalService.getStatistiqueDuJour(today);

        Map<String, Object> etat = new HashMap<>();
        
        // Récupérer le montant total réel de la caisse
        double montantTotalCaisseReel = caisseInternalService.getMontantTotalCaisseReel();
        
        if (statistiqueOpt.isPresent()) {
            Statistique statistique = statistiqueOpt.get();
            
            // Formatage des données pour l'API
            etat.put("estOuverte", statistique.getEstCaisseOuverte());
            etat.put("dateOuverture", statistique.getDateOuvertureCaisse());
            etat.put("montantInitial", statistique.getMontantCaisseOuverture() != null ? statistique.getMontantCaisseOuverture() : 0.0);
            etat.put("ventesDuJour", statistique.getVenteJournaliere() != null ? statistique.getVenteJournaliere() : 0.0);
            etat.put("pertesDuJour", statistique.getPerteJournaliere() != null ? statistique.getPerteJournaliere() : 0.0);
            etat.put("montantFermeture", statistique.getMontantCaisseFermeture() != null ? statistique.getMontantCaisseFermeture() : 0.0);
            etat.put("montantTotalCaisseReel", montantTotalCaisseReel);
            
            // Informations additionnelles pour l'API
            etat.put("date", today.toString());
            etat.put("status", statistique.getEstCaisseOuverte() ? "OUVERTE" : "FERMEE");
            
        } else {
            // Formatage par défaut quand aucune caisse n'est ouverte
            etat.put("estOuverte", false);
            etat.put("dateOuverture", null);
            etat.put("montantInitial", 0.0);
            etat.put("ventesDuJour", 0.0);
            etat.put("pertesDuJour", 0.0);
            etat.put("montantFermeture", 0.0);
            etat.put("montantTotalCaisseReel", montantTotalCaisseReel);
            etat.put("date", today.toString());
            etat.put("status", "FERMEE");
        }

        logger.debug("État de la caisse formaté pour l'API : {}", etat);
        return etat;
    }

    /**
     * Vérifie si la caisse est ouverte (pour l'API)
     * API LOGIC : Exposition simple d'une fonctionnalité
     */
    public boolean isCaisseOuverte() {
        logger.debug("Vérification de l'état d'ouverture de la caisse pour l'API");
        return caisseInternalService.isCaisseOuverte();
    }

    /**
     * Ouvre automatiquement la caisse (délégation pure)
     * API LOGIC : Exposition d'une action
     */
    public void ouvrirCaisseAutomatiquement() {
        logger.info("Ouverture automatique de la caisse demandée via API");
        caisseInternalService.ouvrirCaisseAutomatiquement();
    }

    /**
     * Ferme manuellement la caisse (délégation pure)
     * API LOGIC : Exposition d'une action avec validation
     */
    public void fermerCaisseManuellement(double montantReel) {
        logger.info("Fermeture manuelle de la caisse demandée via API avec montant: {} FCFA", montantReel);
        
        // Validation API (logique de validation, pas de calcul métier)
        if (montantReel < 0) {
            throw new IllegalArgumentException("Le montant réel ne peut pas être négatif");
        }
        
        caisseInternalService.fermerCaisseManuellement(montantReel);
    }

    /**
     * Ferme automatiquement la caisse (délégation pure)
     * API LOGIC : Exposition d'une action
     */
    public void fermerCaisseAutomatiquement() {
        logger.info("Fermeture automatique de la caisse demandée via API");
        caisseInternalService.fermerCaisseAutomatiquement();
    }

    /**
     * Met à jour les ventes en temps réel (délégation pure)
     * API LOGIC : Exposition d'une action
     */
    public void updateVentesJournalieresRealtime() {
        logger.debug("Mise à jour des ventes en temps réel demandée via API");
        caisseInternalService.updateVentesJournalieresRealtime();
    }

    /**
     * Met à jour le montant réel de la caisse physique (délégation pure)
     * API LOGIC : Exposition d'une action avec validation
     */
    public void updateMontantTotalCaisseReel(double nouveauMontant) {
        logger.info("Mise à jour du montant réel de la caisse demandée via API: {} FCFA", nouveauMontant);
        
        // Validation API (logique de validation, pas de calcul métier)
        if (nouveauMontant < 0) {
            throw new IllegalArgumentException("Le montant de la caisse ne peut pas être négatif");
        }
        
        caisseInternalService.updateMontantTotalCaisseReel(nouveauMontant);
    }

    /**
     * Récupère le montant total réel de la caisse physique (délégation pure)
     * API LOGIC : Exposition d'une donnée
     */
    public double getMontantTotalCaisseReel() {
        logger.debug("Récupération du montant total réel de la caisse demandée via API");
        return caisseInternalService.getMontantTotalCaisseReel();
    }

    /**
     * Récupère les statistiques de caisse pour une date donnée
     * API LOGIC : Formatage de réponse pour une date spécifique
     */
    public Map<String, Object> getCaisseEtatPourDate(LocalDate date) {
        logger.debug("Récupération de l'état de la caisse pour la date {} via API", date);
        
        Optional<Statistique> statistiqueOpt = caisseInternalService.getStatistiqueDuJour(date);
        Map<String, Object> etat = new HashMap<>();
        
        if (statistiqueOpt.isPresent()) {
            Statistique statistique = statistiqueOpt.get();
            
            etat.put("date", date.toString());
            etat.put("estOuverte", statistique.getEstCaisseOuverte());
            etat.put("dateOuverture", statistique.getDateOuvertureCaisse());
            etat.put("dateFermeture", statistique.getDateFermetureCaisse());
            etat.put("montantInitial", statistique.getMontantCaisseOuverture() != null ? statistique.getMontantCaisseOuverture() : 0.0);
            etat.put("ventesDuJour", statistique.getVenteJournaliere() != null ? statistique.getVenteJournaliere() : 0.0);
            etat.put("pertesDuJour", statistique.getPerteJournaliere() != null ? statistique.getPerteJournaliere() : 0.0);
            etat.put("montantFermeture", statistique.getMontantCaisseFermeture() != null ? statistique.getMontantCaisseFermeture() : 0.0);
            etat.put("status", statistique.getEstCaisseOuverte() ? "OUVERTE" : "FERMEE");
            
        } else {
            etat.put("date", date.toString());
            etat.put("estOuverte", false);
            etat.put("dateOuverture", null);
            etat.put("dateFermeture", null);
            etat.put("montantInitial", 0.0);
            etat.put("ventesDuJour", 0.0);
            etat.put("pertesDuJour", 0.0);
            etat.put("montantFermeture", 0.0);
            etat.put("status", "FERMEE");
        }

        return etat;
    }
}
