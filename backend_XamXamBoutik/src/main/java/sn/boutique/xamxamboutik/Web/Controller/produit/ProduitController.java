package sn.boutique.xamxamboutik.Web.Controller.produit;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitProjection;
import sn.boutique.xamxamboutik.Service.approvisionnement.IExcelApproImportService;
import sn.boutique.xamxamboutik.Service.produit.ProduitService;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import sn.boutique.xamxamboutik.Web.Controller.base.AbstractBaseController;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.UpdateStockRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.mobile.ProduitResponseMobileDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitResponseWebDTO;

import java.util.List;
import java.util.Map;

@Tag(name = "Produit", description = "API de gestion des produits")
@RestController
@RequestMapping(produces = "application/json")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ProduitController extends AbstractBaseController<
        Produit,
        ProduitRequestDTO,
        ProduitResponseWebDTO,
        ProduitResponseMobileDTO> {

    private final ProduitService produitService;
    private final IExcelApproImportService excelImportService;
    private final ProduitMapper produitMapper;

    @Override protected ProduitService getService() { return produitService; }
    @Override protected Produit toEntity(ProduitRequestDTO d) { return produitMapper.toEntity(d); }
    @Override protected ProduitResponseWebDTO toWebResponse(Produit e) { return produitMapper.toResponseWebDTO(e); }
    @Override protected ProduitResponseMobileDTO toMobileResponse(Produit e) { return produitMapper.toResponseMobileDTO(e); }
    @Override protected List<ProduitResponseWebDTO> toWebResponseList(List<Produit> l) { return produitMapper.toResponseWebDTOs(l); }
    @Override protected List<ProduitResponseMobileDTO> toMobileResponseList(List<Produit> l) { return produitMapper.toResponseMobileDTOs(l); }

    @GetMapping("/produits")
    public ApiResponse<?> getProduitsProjection(@RequestParam(defaultValue="1") int page,
                                                @RequestParam(defaultValue="10") int size) {
        Page<ProduitProjection> pg = produitService.findAllProjection(PageRequest.of(page-1, size));
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pg, produitMapper.toResponseWebDTOsFromProjection(pg.getContent()));
        return ApiResponse.success("Produits récupérés", data);
    }

    @GetMapping("/produits/deleted")
    public ApiResponse<?> getDeletedProduits(@RequestParam(defaultValue="1") int page,
                                             @RequestParam(defaultValue="10") int size) {
        Page<ProduitProjection> pg = produitService.findDeletedProjection(PageRequest.of(page-1, size));
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pg, produitMapper.toResponseWebDTOsFromProjection(pg.getContent()));
        return ApiResponse.success("Produits supprimés récupérés", data);
    }

    @GetMapping("/produits/category/{id}")
    public ApiResponse<?> getProduitsByCategory(@PathVariable Long id,
                                                @RequestParam(defaultValue="1") int page,
                                                @RequestParam(defaultValue="10") int size) {
        Page<ProduitProjection> pg = produitService.findByCategoryId(id, PageRequest.of(page-1, size));
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pg, produitMapper.toResponseWebDTOsFromProjection(pg.getContent()));
        return ApiResponse.success("Produits par catégorie récupérés", data);
    }

    @PostMapping("/produits")
    public ResponseEntity<ApiResponse<?>> saveProduit(@Valid @RequestPart("produit") ProduitRequestDTO dto,
                                                      @RequestPart(value="file", required=false) MultipartFile file) throws Exception {
        Produit saved = produitService.save(dto, file);
        return ResponseEntity.ok(ApiResponse.success("Produit créé", saved));
    }

    @PutMapping("/produits/{id}")
    public ResponseEntity<ApiResponse<?>> updateProduit(@PathVariable Long id,
                                                        @Valid @RequestPart("produit") ProduitRequestDTO dto,
                                                        @RequestPart(value="file", required=false) MultipartFile file) throws Exception {
        dto.setId(id);
        Produit updated = produitService.update(dto, file);
        return ResponseEntity.ok(ApiResponse.success("Produit mis à jour", updated));
    }

    @DeleteMapping("/produits/{id}")
    public ApiResponse<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteById(id);
        return ApiResponse.success("Produit supprimé", null);
    }

    @PutMapping("/produits/{id}/restore")
    public ApiResponse<?> restoreProduit(@PathVariable Long id) throws Exception {
        Produit restored = produitService.restore(id);
        return ApiResponse.success("Produit restauré", produitMapper.toResponseWebDTO(restored));
    }

    @GetMapping("/produits/suggestions")
    public ApiResponse<?> suggestions(@RequestParam String query,
                                      @RequestParam(defaultValue="1") int page,
                                      @RequestParam(defaultValue="10") int size) {
        Page<ProduitProjection> pg = produitService.suggestionsByLibelleProjection(query, PageRequest.of(page-1, size));
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pg, produitMapper.toResponseWebDTOsFromProjection(pg.getContent()));
        return ApiResponse.success("Suggestions", data);
    }

    @GetMapping("/produits/approvisionnement/suggestions")
    public ApiResponse<?> suggestionsAppro(@RequestParam String query,
                                           @RequestParam(defaultValue="1") int page,
                                           @RequestParam(defaultValue="10") int size) {
        Page<AddApproProductLibelleSearchResponseDTO> pg =
                produitService.suggestionsForApprovisionnement(query, PageRequest.of(page-1, size));
        Map<String, Object> data = PaginationUtil.buildPaginationMap(pg, pg.getContent());
        return ApiResponse.success("Suggestions approvisionnement", data);
    }

    @PostMapping("/produits/import/excel")
    public ResponseEntity<ApiResponse<?>> importExcel(@RequestBody List<ProduitRequestDTO> lignes) {
        try {
            Map<String, Object> res = excelImportService.importProduitsExcel(lignes);
            return ResponseEntity.ok(ApiResponse.success("Import terminé", res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/api/products/barcode/{barcode}")
    public ResponseEntity<ApiResponse<?>> findByBarcode(@PathVariable String barcode,
                                                        @RequestHeader(value="X-Client-Type", defaultValue="web") String clientType) {
        Produit p = produitService.findByCode(barcode)
                .orElseThrow(() -> new EntityNotFoundException("Produit "+barcode, ErrorCodes.ENTITY_NOT_FOUND));
        Object dto = "mobile".equalsIgnoreCase(clientType)
                ? produitMapper.toResponseMobileDTO(p)
                : produitMapper.toResponseWebDTO(p);
        return ResponseEntity.ok(ApiResponse.success("Produit trouvé", dto));
    }

    @PostMapping("/produits/update-stock")
    public ResponseEntity<ApiResponse<?>> updateStock(@Valid @RequestBody UpdateStockRequestDTO dto) {
        Produit updated = produitService.updateStock(dto.getProduitId(), dto.getQuantite(), dto.getPrixAchat());
        return ResponseEntity.ok(ApiResponse.success("Stock mis à jour", produitMapper.toResponseWebDTO(updated)));
    }
}