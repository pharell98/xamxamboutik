package sn.boutique.xamxamboutik.Web.Controller.vente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Enums.TypeRetour;
import sn.boutique.xamxamboutik.Service.vente.IRetourService;
import sn.boutique.xamxamboutik.Service.vente.RetourService;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;

@Tag(name = "Retours", description = "API de gestion des remboursements, échanges et annulations de produits")
@RestController
@RequestMapping("/retours")
@CrossOrigin("*")
public class RetourController {

    private final IRetourService retourService;
    private final RetourService concreteRetourService;

    public RetourController(IRetourService retourService, RetourService concreteRetourService) {
        this.retourService = retourService;
        this.concreteRetourService = concreteRetourService;
    }

    @PostMapping("/remboursement")
    @Operation(summary = "Créer un remboursement pour un produit vendu (spécifier le sous-type dans le DTO)")
    public ResponseEntity<ApiResponse<Void>> createRemboursement(@Valid @RequestBody RemboursementRequestDTO dto) {
        retourService.createRemboursement(dto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement créé avec succès", null));
    }

    @PostMapping("/remboursement/avec-retour-bon-etat")
    @Operation(summary = "Remboursement avec retour du produit en bon état")
    public ResponseEntity<ApiResponse<Void>> createRemboursementBonEtat(@RequestBody RemboursementRequestDTO dto) {
        dto.setSousType(TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT);
        retourService.createRemboursementBonEtat(dto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement avec retour en bon état créé avec succès", null));
    }

    @PostMapping("/remboursement/defectueux")
    @Operation(summary = "Remboursement pour produit défectueux")
    public ResponseEntity<ApiResponse<Void>> createRemboursementDefectueux(@RequestBody RemboursementRequestDTO dto) {
        dto.setSousType(TypeRetour.REMBOURSEMENT_DEFECTUEUX);
        retourService.createRemboursementDefectueux(dto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement pour produit défectueux créé avec succès", null));
    }

    @PostMapping("/echange")
    @Operation(summary = "Créer un échange pour un produit (spécifier le sous-type dans le DTO)")
    public ResponseEntity<ApiResponse<Void>> createEchange(@Valid @RequestBody EchangeRequestDTO dto) {
        retourService.createEchange(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange créé avec succès", null));
    }

    @PostMapping("/echange/defectueux")
    @Operation(summary = "Échange pour produit défectueux")
    public ResponseEntity<ApiResponse<Void>> createEchangeDefectueux(@RequestBody EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_DEFECTUEUX);
        retourService.createEchangeDefectueux(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour produit défectueux créé avec succès", null));
    }

    @PostMapping("/echange/changement-preference")
    @Operation(summary = "Échange pour changement de préférence (taille, couleur, etc.)")
    public ResponseEntity<ApiResponse<Void>> createEchangeChangementPreference(@RequestBody EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE);
        retourService.createEchangeChangementPreference(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour changement de préférence créé avec succès", null));
    }

    @PostMapping("/echange/ajustement-prix")
    @Operation(summary = "Échange avec ajustement de prix")
    public ResponseEntity<ApiResponse<Void>> createEchangeAjustementPrix(@RequestBody EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_AJUSTEMENT_PRIX);
        retourService.createEchangeAjustementPrix(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange avec ajustement de prix créé avec succès", null));
    }

    @PostMapping("/admin/cleanup-negative-payments")
    @Operation(summary = "ADMIN UNIQUEMENT : Nettoie les paiements négatifs existants dans la base de données")
    public ResponseEntity<ApiResponse<Void>> cleanupNegativePayments() {
        concreteRetourService.cleanupNegativePayments();
        return ResponseEntity.ok(ApiResponse.success("Nettoyage des paiements négatifs terminé avec succès", null));
    }

}