package sn.boutique.xamxamboutik.Web.Controller.vente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.vente.IRetourService;
import sn.boutique.xamxamboutik.Web.DTO.Request.AnnulationRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Enums.TypeRetour;

@Tag(name = "Retours", description = "API de gestion des remboursements, échanges et annulations de produits")
@RestController
@RequestMapping("/retours")
@CrossOrigin("*")
public class RetourController {

    private final IRetourService retourService;

    public RetourController(IRetourService retourService) {
        this.retourService = retourService;
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
        RemboursementRequestDTO newDto = new RemboursementRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setSousType(TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT);
        retourService.createRemboursementBonEtat(newDto);
        return ResponseEntity.ok(ApiResponse.success("Remboursement avec retour en bon état créé avec succès", null));
    }

    @PostMapping("/remboursement/defectueux")
    @Operation(summary = "Remboursement pour produit défectueux")
    public ResponseEntity<ApiResponse<Void>> createRemboursementDefectueux(@RequestBody RemboursementRequestDTO dto) {
        RemboursementRequestDTO newDto = new RemboursementRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setSousType(TypeRetour.REMBOURSEMENT_DEFECTUEUX);
        retourService.createRemboursementDefectueux(newDto);
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
        EchangeRequestDTO newDto = new EchangeRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setProduitRemplacementId(dto.getProduitRemplacementId());
        newDto.setSousType(TypeRetour.ECHANGE_DEFECTUEUX);
        retourService.createEchangeDefectueux(newDto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour produit défectueux créé avec succès", null));
    }

    @PostMapping("/echange/changement-preference")
    @Operation(summary = "Échange pour changement de préférence (taille, couleur, etc.)")
    public ResponseEntity<ApiResponse<Void>> createEchangeChangementPreference(@RequestBody EchangeRequestDTO dto) {
        EchangeRequestDTO newDto = new EchangeRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setProduitRemplacementId(dto.getProduitRemplacementId());
        newDto.setSousType(TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE);
        retourService.createEchangeChangementPreference(newDto);
        return ResponseEntity.ok(ApiResponse.success("Échange pour changement de préférence créé avec succès", null));
    }

    @PostMapping("/echange/ajustement-prix")
    @Operation(summary = "Échange avec ajustement de prix")
    public ResponseEntity<ApiResponse<Void>> createEchangeAjustementPrix(@RequestBody EchangeRequestDTO dto) {
        EchangeRequestDTO newDto = new EchangeRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setProduitRemplacementId(dto.getProduitRemplacementId());
        newDto.setSousType(TypeRetour.ECHANGE_AJUSTEMENT_PRIX);
        retourService.createEchangeAjustementPrix(newDto);
        return ResponseEntity.ok(ApiResponse.success("Échange avec ajustement de prix créé avec succès", null));
    }

    @PostMapping("/annulation")
    @Operation(summary = "Créer une annulation pour un produit vendu (spécifier le sous-type dans le DTO)")
    public ResponseEntity<ApiResponse<Void>> createAnnulation(@Valid @RequestBody AnnulationRequestDTO dto) {
        retourService.createAnnulation(dto);
        return ResponseEntity.ok(ApiResponse.success("Annulation créée avec succès", null));
    }

    @PostMapping("/annulation/apres-livraison")
    @Operation(summary = "Annulation après livraison avec retour")
    public ResponseEntity<ApiResponse<Void>> createAnnulationApresLivraison(@RequestBody AnnulationRequestDTO dto) {
        AnnulationRequestDTO newDto = new AnnulationRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setSousType(TypeRetour.ANNULATION_APRES_LIVRAISON);
        retourService.createAnnulationApresLivraison(newDto);
        return ResponseEntity.ok(ApiResponse.success("Annulation après livraison créée avec succès", null));
    }

    @PostMapping("/annulation/partielle")
    @Operation(summary = "Annulation partielle d'une commande")
    public ResponseEntity<ApiResponse<Void>> createAnnulationPartielle(@RequestBody AnnulationRequestDTO dto) {
        AnnulationRequestDTO newDto = new AnnulationRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setSousType(TypeRetour.ANNULATION_PARTIELLE);
        retourService.createAnnulationPartielle(newDto);
        return ResponseEntity.ok(ApiResponse.success("Annulation partielle créée avec succès", null));
    }

    @PostMapping("/annulation/non-conformite")
    @Operation(summary = "Annulation pour non-conformité du produit")
    public ResponseEntity<ApiResponse<Void>> createAnnulationNonConformite(@RequestBody AnnulationRequestDTO dto) {
        AnnulationRequestDTO newDto = new AnnulationRequestDTO();
        newDto.setDetailVenteId(dto.getDetailVenteId());
        newDto.setMotif(dto.getMotif());
        newDto.setQuantiteRetour(dto.getQuantiteRetour());
        newDto.setSousType(TypeRetour.ANNULATION_NON_CONFORMITE);
        retourService.createAnnulationNonConformite(newDto);
        return ResponseEntity.ok(ApiResponse.success("Annulation pour non-conformité créée avec succès", null));
    }
}