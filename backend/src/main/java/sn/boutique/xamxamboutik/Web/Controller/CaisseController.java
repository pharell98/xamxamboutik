package sn.boutique.xamxamboutik.Web.Controller;

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
     * GET /api/caisse/etat
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
     * POST /api/caisse/fermer
     * Body: { "montantReel": 25000.0 }
     */
    @PostMapping("/fermer")
    public ResponseEntity<Map<String, Object>> fermerCaisseManuellement(@RequestBody Map<String, Object> request) {
        try {
            double montantReel = ((Number) request.get("montantReel")).doubleValue();
            caisseApiService.fermerCaisseManuellement(montantReel);
            
            // Retourner l'état de la caisse après fermeture
            Map<String, Object> etat = caisseApiService.getCaisseEtat();
            return ResponseEntity.ok(etat);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Force la mise à jour des ventes en temps réel
     * POST /api/caisse/refresh
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
     * GET /api/caisse/is-ouverte
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

    /**
     * Met à jour le montant total réel de la caisse physique
     * POST /api/caisse/update-montant-reel
     * Body: { "montantReel": 25000.0 }
     */
    @PostMapping("/update-montant-reel")
    public ResponseEntity<Map<String, Object>> updateMontantReel(@RequestBody Map<String, Object> request) {
        try {
            double montantReel = ((Number) request.get("montantReel")).doubleValue();
            caisseApiService.updateMontantTotalCaisseReel(montantReel);
            
            // Retourner l'état de la caisse après mise à jour
            Map<String, Object> etat = caisseApiService.getCaisseEtat();
            return ResponseEntity.ok(etat);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
