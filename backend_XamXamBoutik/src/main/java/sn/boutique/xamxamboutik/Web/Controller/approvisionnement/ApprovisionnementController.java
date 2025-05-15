package sn.boutique.xamxamboutik.Web.Controller.approvisionnement;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProjection;
import sn.boutique.xamxamboutik.Service.approvisionnement.ApprovisionnementService;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ApprovisionnementMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ApprovisionnementProductDTO;
import java.util.Map;
import static java.util.Objects.requireNonNull;

@Slf4j
@Tag(name = "Approvisionnement", description = "API de gestion des approvisionnements")
@RestController
@CrossOrigin("*")
@RequestMapping(produces = "application/json")
@RequiredArgsConstructor
public class ApprovisionnementController {
    private final ApprovisionnementService approvisionnementService;
    private final ApprovisionnementMapper approvisionnementMapper;

    @PostMapping(value = "approvisionnement/supply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Créer un approvisionnement",
            description = "Crée un nouvel approvisionnement via multipart/form-data."
    )
    public ResponseEntity<ApiResponse<?>> createApprovisionnement(
            @Valid @RequestPart("dto") ApprovisionnementRequestDTO dto,
            @RequestPart(value = "newproduitImages", required = false) MultipartFile[] newProduitImages
    ) {
        requireNonNull(dto, "Le DTO d'approvisionnement ne peut pas être nul");
        try {
            Approvisionnement approvisionnement = approvisionnementService.createApprovisionnement(dto, newProduitImages);
            return ResponseEntity.ok(ApiResponse.success("Approvisionnement créé avec succès", approvisionnement));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/approvisionnements")
    @Operation(
            summary = "Récupérer la liste des approvisionnements",
            description = "Retourne la liste paginée des approvisionnements."
    )
    public ResponseEntity<ApiResponse<?>> getApprovisionnements(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        if (page < 1 || size < 1) throw new IllegalArgumentException("Les paramètres de pagination doivent être positifs");
        Page<ApprovisionnementProjection> pagedApprovisionnements = approvisionnementService.getAllApprovisionnements(PageRequest.of(page - 1, size));
        Map<String, Object> response = PaginationUtil.buildPaginationMap(
                pagedApprovisionnements,
                approvisionnementMapper.toResponseDTOsFromProjection(pagedApprovisionnements.getContent())
        );
        return ResponseEntity.ok(ApiResponse.success("Liste des approvisionnements récupérée avec succès", response));
    }

    @GetMapping("/approvisionnements/{id}/products")
    @Operation(
            summary = "Récupérer les produits d'un approvisionnement",
            description = "Retourne la liste paginée des produits d'un approvisionnement."
    )
    public ResponseEntity<ApiResponse<?>> getProductsByApprovisionnement(
            @PathVariable("id") Long approId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        requireNonNull(approId, "L'ID de l'approvisionnement ne peut pas être nul");
        if (page < 1 || size < 1) throw new IllegalArgumentException("Les paramètres de pagination doivent être positifs");
        Page<ApprovisionnementProductDTO> productPage = approvisionnementService.getProductsByApprovisionnement(approId, PageRequest.of(page - 1, size));
        Map<String, Object> response = PaginationUtil.buildPaginationMap(productPage, productPage.getContent());
        return ResponseEntity.ok(ApiResponse.success("Produits de l'approvisionnement récupérés avec succès", response));
    }
}