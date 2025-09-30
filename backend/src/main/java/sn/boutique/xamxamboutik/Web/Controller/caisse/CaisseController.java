package sn.boutique.xamxamboutik.Web.Controller.caisse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.statistique.CaisseApiService;

import java.util.Map;

/**
 * Contrôleur pour la gestion de la caisse
 * Expose les fonctionnalités de gestion de caisse selon SYSTEME_GESTION_CAISSE.md
 */
@RestController
@RequestMapping("/caisse")
@CrossOrigin(origins = "*")
public class CaisseController {

    @Autowired
    private CaisseApiService caisseApiService;

    /**
     * Récupère l'état actuel de la caisse en temps réel
     * GET /caisse/etat
     */
    @GetMapping("/etat")
    public ResponseEntity<Map<String, Object>> getCaisseEtat() {
        try {
            Map<String, Object> etat = caisseApiService.getCaisseEtat();
            return ResponseEntity.ok(etat);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Ferme manuellement la caisse avant 23h59
     * POST /caisse/fermer
     */
    @PostMapping("/fermer")
    public ResponseEntity<Map<String, Object>> fermerCaisseManuellement() {
        try {
            caisseApiService.fermerCaisseManuellement();
            
            // Retourner l'état de la caisse après fermeture
            Map<String, Object> etat = caisseApiService.getCaisseEtat();
            return ResponseEntity.ok(etat);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Force la mise à jour des ventes en temps réel
     * POST /caisse/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshVentesRealtime() {
        try {
            caisseApiService.updateVentesJournalieresRealtime();
            Map<String, Object> etat = caisseApiService.getCaisseEtat();
            return ResponseEntity.ok(etat);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Vérifie si la caisse est ouverte
     * GET /caisse/is-ouverte
     */
    @GetMapping("/is-ouverte")
    public ResponseEntity<Map<String, Object>> isCaisseOuverte() {
        try {
            boolean estOuverte = caisseApiService.isCaisseOuverte();
            return ResponseEntity.ok(Map.of("estOuverte", estOuverte));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    
}
