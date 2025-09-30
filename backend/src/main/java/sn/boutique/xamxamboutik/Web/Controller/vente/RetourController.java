package sn.boutique.xamxamboutik.Web.Controller.vente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.vente.IRetourService;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;

@Tag(name = "Retours", description = "API de gestion des remboursements, échanges et annulations de produits")
@RestController
@RequestMapping("/retours")
@CrossOrigin("*")
public class RetourController {

    private final IRetourService retourService;

    public RetourController(IRetourService retourService) {
        this.retourService = retourService;
    }

    @PostMapping("/remboursement/avec-retour-bon-etat")
    @Operation(summary = "Remboursement avec retour du produit en bon état")
    public ResponseEntity<ApiResponse<Void>> createRemboursementBonEtat(@RequestBody RemboursementRequestDTO dto) {
        retourService.createRemboursementBonEtat(dto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement avec retour en bon état créé avec succès", null));
    }

    @PostMapping("/remboursement/defectueux")
    @Operation(summary = "Remboursement pour produit défectueux")
    public ResponseEntity<ApiResponse<Void>> createRemboursementDefectueux(@RequestBody RemboursementRequestDTO dto) {
        retourService.createRemboursementDefectueux(dto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement pour produit défectueux créé avec succès", null));
    }

    @PostMapping("/echange/defectueux")
    @Operation(summary = "Échange pour produit défectueux")
    public ResponseEntity<ApiResponse<Void>> createEchangeDefectueux(@RequestBody EchangeRequestDTO dto) {
        retourService.createEchangeDefectueux(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour produit défectueux créé avec succès", null));
    }

    @PostMapping("/echange/changement-preference")
    @Operation(summary = "Échange pour changement de préférence (taille, couleur, etc.)")
    public ResponseEntity<ApiResponse<Void>> createEchangeChangementPreference(@RequestBody EchangeRequestDTO dto) {
        retourService.createEchangeChangementPreference(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour changement de préférence créé avec succès", null));
    }

    @PostMapping("/echange/ajustement-prix")
    @Operation(summary = "Échange avec ajustement de prix")
    public ResponseEntity<ApiResponse<Void>> createEchangeAjustementPrix(@RequestBody EchangeRequestDTO dto) {
        retourService.createEchangeAjustementPrix(dto);
        return ResponseEntity.ok(ApiResponse.success("Échange avec ajustement de prix créé avec succès", null));
    }
}