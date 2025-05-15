package sn.boutique.xamxamboutik.Web.Controller.produit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Entity.produit.Categorie;
import sn.boutique.xamxamboutik.Service.produit.CategorieService;
import sn.boutique.xamxamboutik.Web.Controller.base.AbstractBaseController;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.CategorieMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.CategorieRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.CategorieResponseDTO;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import java.util.List;
@Tag(name = "Categorie", description = "API de gestion des catégories")
@RestController
@RequestMapping(produces = "application/json")
@CrossOrigin("*")
public class CategorieController extends AbstractBaseController<
        Categorie,
        CategorieRequestDTO,
        CategorieResponseDTO,
        CategorieResponseDTO> {
    @Autowired
    private CategorieService categorieService;
    @Autowired
    private CategorieMapper categorieMapper;
    @Override
    protected CategorieService getService() {
        return categorieService;
    }
    @Override
    protected Categorie toEntity(CategorieRequestDTO dto) {
        return categorieMapper.toEntity(dto);
    }
    @Override
    protected CategorieResponseDTO toWebResponse(Categorie entity) {
        return categorieMapper.toResponseDTO(entity);
    }
    @Override
    protected CategorieResponseDTO toMobileResponse(Categorie entity) {
        return categorieMapper.toResponseDTO(entity);
    }
    @Override
    protected List<CategorieResponseDTO> toWebResponseList(List<Categorie> entities) {
        return categorieMapper.toResponseDTOs(entities);
    }
    @Override
    protected List<CategorieResponseDTO> toMobileResponseList(List<Categorie> entities) {
        return categorieMapper.toResponseDTOs(entities);
    }
    @GetMapping("/categories")
    @Operation(
            summary = "Récupérer les catégories paginées",
            description = "Retourne la liste paginée des catégories actives (non supprimées)."
    )
    public ApiResponse<?> getCategories(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) {
        return super.findAll(page - 1, size, clientType).getBody();
    }
    @GetMapping("/categories/{id}")
    @Operation(
            summary = "Récupérer une catégorie par ID",
            description = "Retourne la catégorie correspondant à l'ID fourni."
    )
    public ApiResponse<?> getCategorieById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) {
        return super.findById(id, clientType).getBody();
    }
    @PostMapping("/categories")
    @Operation(
            summary = "Créer ou mettre à jour une catégorie",
            description = "Crée ou met à jour une catégorie avec vérification de l'unicité du libellé."
    )
    public ResponseEntity<ApiResponse<?>> save(@Valid @RequestBody CategorieRequestDTO dto) {
        return super.save(dto);
    }
    @DeleteMapping("/categories/{id}")
    @Operation(
            summary = "Supprimer une catégorie",
            description = "Marque la catégorie comme supprimée (soft delete) si elle ne contient aucun produit."
    )
    public ApiResponse<Void> deleteCategorie(@PathVariable Long id) {
        categorieService.deleteById(id);
        return ApiResponse.success("Catégorie supprimée avec succès", null);
    }
    @PutMapping("/categories/{id}")
    @Operation(
            summary = "Mettre à jour une catégorie",
            description = "Met à jour une catégorie existante."
    )
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody CategorieRequestDTO dto) {
        return super.update(id, dto);
    }
    @GetMapping("/categories/deleted")
    @Operation(
            summary = "Récupérer les catégories supprimées",
            description = "Retourne la liste paginée des catégories supprimées (soft delete)."
    )
    public ApiResponse<?> getDeletedCategories(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType) {
        Page<Categorie> pagedDeleted = categorieService.findAllDeleted(PageRequest.of(page - 1, size));
        return ApiResponse.success("Catégories supprimées récupérées avec succès",
                PaginationUtil.buildPaginationMap(pagedDeleted, categorieMapper.toResponseDTOs(pagedDeleted.getContent())));
    }
    @PutMapping("/categories/{id}/restore")
    @Operation(
            summary = "Restaurer une catégorie supprimée",
            description = "Restaure une catégorie qui a été supprimée (soft delete)."
    )
    public ApiResponse<?> restoreCategorie(@PathVariable Long id) throws Exception {
        Categorie restored = categorieService.restore(id);
        return ApiResponse.success("Catégorie restaurée avec succès", categorieMapper.toResponseDTO(restored));
    }
    @GetMapping("/categories/suggestions")
    @Operation(
            summary = "Récupérer les catégories paginées en projection",
            description = "Retourne la liste paginée des catégories actives sous forme de projection."
    )
    public ApiResponse<?> getCategoriesProjection(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) throws Exception {
        Page<?> pagedCategories = categorieService.findAllProjection(PageRequest.of(page - 1, size));
        return ApiResponse.success("Catégories récupérées en projection avec succès",
                PaginationUtil.buildPaginationMap(pagedCategories, pagedCategories.getContent()));
    }
    @GetMapping("/categories/search")
    @Operation(
            summary = "Rechercher une catégorie en projection",
            description = "Retourne la liste paginée des catégories dont le libellé contient le terme fourni, sous forme de projection."
    )
    public ApiResponse<?> searchCategoriesProjection(
            @RequestParam("query") String query,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) throws Exception {
        Page<?> pagedCategories = categorieService.searchByLibelleProjection(query, PageRequest.of(page - 1, size));
        if (pagedCategories.getTotalElements() == 0) {
            return ApiResponse.error("La catégorie recherchée est inexistante");
        }
        return ApiResponse.success("Résultats de la recherche récupérés en projection avec succès",
                PaginationUtil.buildPaginationMap(pagedCategories, pagedCategories.getContent()));
    }
    @GetMapping(value = "/categories/suggestions", params = "query")
    @Operation(
            summary = "Suggestions de catégories en projection",
            description = "Retourne la liste paginée des catégories dont le libellé commence par les caractères saisis, sous forme de projection."
    )
    public ApiResponse<?> suggestionsCategoriesProjection(
            @RequestParam("query") String query,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) throws Exception {
        Page<?> pagedSuggestions = categorieService.suggestionsByLibelleProjection(query, PageRequest.of(page - 1, size));
        return ApiResponse.success("Suggestions récupérées en projection avec succès",
                PaginationUtil.buildPaginationMap(pagedSuggestions, pagedSuggestions.getContent()));
    }
}
