package sn.boutique.xamxamboutik.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Service.statistique.CaisseInternalService;

import java.util.Map;

/**
 * Scheduler pour la gestion automatique de la caisse
 * Fermeture automatique à 23h59 chaque jour selon SYSTEME_GESTION_CAISSE.md
 */
@Component
public class CaisseScheduler {
    private static final Logger logger = LoggerFactory.getLogger(CaisseScheduler.class);

    @Autowired
    private CaisseInternalService caisseInternalService;

    /**
     * Fermeture automatique de la caisse à 23h59 chaque jour
     * Cron: 0 59 23 * * ? = 23h59 tous les jours
     */
    @Scheduled(cron = "0 59 23 * * ?")
    public void fermerCaisseAutomatiquement() {
        try {
            logger.info("Déclenchement de la fermeture automatique de caisse à 23h59");
            caisseInternalService.fermerCaisseAutomatiquement();
            logger.info("Fermeture automatique de caisse terminée avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de la fermeture automatique de la caisse", e);
        }
    }

    /**
     * Vérification périodique de l'état de la caisse (optionnel)
     * Exécuté toutes les heures pour logging
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void verifierEtatCaisse() {
        try {
            // Pour le scheduler, on utilise directement la vérification d'état
            boolean estOuverte = caisseInternalService.isCaisseOuverte();
            
            if (estOuverte) {
                logger.debug("État de la caisse: OUVERTE");
            } else {
                logger.debug("État de la caisse: FERMÉE");
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification de l'état de la caisse", e);
        }
    }
}
