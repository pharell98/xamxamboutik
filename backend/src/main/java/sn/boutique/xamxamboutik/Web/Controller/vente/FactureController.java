package sn.boutique.xamxamboutik.Web.Controller.vente;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.vente.IFactureService;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;

import java.time.LocalDate;

@RestController
@RequestMapping("factures")
@CrossOrigin(origins = "*")
public class FactureController {

    private final IFactureService factureService;

    @Autowired
    public FactureController(IFactureService factureService) {
        this.factureService = factureService;
    }


    /**
     * Récupère toutes les ventes avec pagination
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> getAllFactures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            FactureListResponseDTO result = factureService.getAllFactures(pageable);
            return ResponseEntity.ok(ApiResponse.success("Ventes récupérées avec succès", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la récupération des ventes: " + e.getMessage()));
        }
    }

    /**
     * Récupère une facture par son numéro (affichage intelligent)
     */
    @GetMapping("/{numeroFacture}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByNumero(
            @PathVariable String numeroFacture) {
        try {
            FactureResponseDTO facture = factureService.getFactureByNumero(numeroFacture);
            return ResponseEntity.ok(ApiResponse.success("Facture récupérée avec succès", facture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facture introuvable: " + e.getMessage()));
        }
    }

    /**
     * Récupère une facture par son numéro en excluant complètement les produits défectueux
     */
    @GetMapping("/{numeroFacture}/clean")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByNumeroClean(
            @PathVariable String numeroFacture) {
        try {
            FactureResponseDTO facture = factureService.getFactureByNumeroExcludingDefective(numeroFacture);
            return ResponseEntity.ok(ApiResponse.success("Facture récupérée avec succès (produits défectueux exclus)", facture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facture introuvable: " + e.getMessage()));
        }
    }


    /**
     * Vérifie si un numéro de facture existe
     */
    @GetMapping("/exists/{numeroFacture}")
    public ResponseEntity<ApiResponse<Boolean>> existsByNumeroFacture(
            @PathVariable String numeroFacture) {
        try {
            boolean exists = factureService.existsByNumeroFacture(numeroFacture);
            String message = exists ? "Numéro de facture existe" : "Numéro de facture n'existe pas";
            return ResponseEntity.ok(ApiResponse.success(message, exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la vérification: " + e.getMessage()));
        }
    }

    /**
     * Récupère toutes les factures du jour en cours
     */
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> getFacturesDuJour(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            FactureListResponseDTO result = factureService.getFacturesDuJour(pageable);
            return ResponseEntity.ok(ApiResponse.success("Factures du jour récupérées avec succès", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la récupération des factures du jour: " + e.getMessage()));
        }
    }

    /**
     * Récupère toutes les factures d'une date donnée
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> getFacturesParDate(
            @PathVariable String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Parser la date depuis le format YYYY-MM-DD
            LocalDate localDate = LocalDate.parse(date);
            Pageable pageable = PageRequest.of(page, size);
            FactureListResponseDTO result = factureService.getFacturesParDate(localDate, pageable);
            return ResponseEntity.ok(ApiResponse.success("Factures de la date récupérées avec succès", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Erreur lors de la récupération des factures par date: " + e.getMessage()));
        }
    }

    /**
     * Récupère toutes les factures du mois en cours
     */
    @GetMapping("/month")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> getFacturesDuMois(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            FactureListResponseDTO result = factureService.getFacturesDuMois(pageable);
            return ResponseEntity.ok(ApiResponse.success("Factures du mois récupérées avec succès", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la récupération des factures du mois: " + e.getMessage()));
        }
    }

}
