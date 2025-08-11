package sn.boutique.xamxamboutik.Web.Controller.vente;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.vente.IFactureService;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureGenerateRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureSearchRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.MiniRecuResponseDTO;

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
     * Génère une facture complète à partir d'une vente
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> generateFacture(
            @Valid @RequestBody FactureGenerateRequestDTO request) {
        try {
            FactureResponseDTO facture = factureService.generateFacture(request);
            return ResponseEntity.ok(ApiResponse.success("Facture générée avec succès", facture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la génération de la facture: " + e.getMessage()));
        }
    }
    
    /**
     * Génère un mini reçu pour imprimante thermique
     */
    @PostMapping("/generate-mini-recu")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> generateMiniRecu(
            @Valid @RequestBody FactureGenerateRequestDTO request) {
        try {
            MiniRecuResponseDTO miniRecu = factureService.generateMiniRecu(request);
            return ResponseEntity.ok(ApiResponse.success("Mini reçu généré avec succès", miniRecu));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la génération du mini reçu: " + e.getMessage()));
        }
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
     * Récupère une facture par son numéro
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
     * Récupère une facture par ID de vente
     */
    @GetMapping("/vente/{venteId}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> getFactureByVenteId(
            @PathVariable Long venteId) {
        try {
            FactureResponseDTO facture = factureService.getFactureByVenteId(venteId);
            return ResponseEntity.ok(ApiResponse.success("Facture récupérée avec succès", facture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Facture introuvable: " + e.getMessage()));
        }
    }
    
    /**
     * Récupère un mini reçu par numéro de facture
     */
    @GetMapping("/{numeroFacture}/mini-recu")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> getMiniRecuByNumero(
            @PathVariable String numeroFacture) {
        try {
            MiniRecuResponseDTO miniRecu = factureService.getMiniRecuByNumero(numeroFacture);
            return ResponseEntity.ok(ApiResponse.success("Mini reçu récupéré avec succès", miniRecu));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Mini reçu introuvable: " + e.getMessage()));
        }
    }
    
    /**
     * Recherche de factures avec filtres et pagination
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<FactureListResponseDTO>> searchFactures(
            @Valid @RequestBody FactureSearchRequestDTO request) {
        try {
            FactureListResponseDTO result = factureService.searchFactures(request);
            return ResponseEntity.ok(ApiResponse.success("Recherche effectuée avec succès", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la recherche: " + e.getMessage()));
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
     * Génère une facture complète à partir d'une vente (endpoint simplifié)
     */
    @PostMapping("/generate-vente/{venteId}")
    public ResponseEntity<ApiResponse<FactureResponseDTO>> generateFactureSimple(
            @PathVariable Long venteId) {
        try {
            FactureGenerateRequestDTO request = new FactureGenerateRequestDTO();
            request.setVenteId(venteId);
            request.setTypeFacture(sn.boutique.xamxamboutik.Enums.TypeFacture.COMPLETE);
            
            FactureResponseDTO facture = factureService.generateFacture(request);
            return ResponseEntity.ok(ApiResponse.success("Facture générée avec succès", facture));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la génération de la facture: " + e.getMessage()));
        }
    }
    
    /**
     * Génère un mini reçu à partir d'une vente (endpoint simplifié)
     */
    @PostMapping("/generate-mini-recu-vente/{venteId}")
    public ResponseEntity<ApiResponse<MiniRecuResponseDTO>> generateMiniRecuSimple(
            @PathVariable Long venteId) {
        try {
            FactureGenerateRequestDTO request = new FactureGenerateRequestDTO();
            request.setVenteId(venteId);
            request.setTypeFacture(sn.boutique.xamxamboutik.Enums.TypeFacture.MINI_RECU);
            
            MiniRecuResponseDTO miniRecu = factureService.generateMiniRecu(request);
            return ResponseEntity.ok(ApiResponse.success("Mini reçu généré avec succès", miniRecu));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erreur lors de la génération du mini reçu: " + e.getMessage()));
        }
    }
}
