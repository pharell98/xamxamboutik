package sn.boutique.xamxamboutik.Web.Controller.produit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitStockProjection;
import sn.boutique.xamxamboutik.Service.produit.ProduitStockService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitMapper;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitStockResponseDTO;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import java.util.List;
@Tag(name = "ProduitStock", description = "API pour la gestion des produits en rupture de stock")
@RestController
@RequestMapping(produces = "application/json")
@CrossOrigin("*")
public class ProduitStockController {
    private final ProduitStockService produitStockService;
    private final ProduitMapper produitMapper;
    @Autowired
    public ProduitStockController(ProduitStockService produitStockService, ProduitMapper produitMapper) {
        this.produitStockService = produitStockService;
        this.produitMapper = produitMapper;
    }
    @GetMapping("/stock/rupture")
    @Operation(
            summary = "Récupérer les produits en rupture de stock",
            description = "Retourne la liste paginée des produits dont le stock est inférieur au seuil de rupture."
    )
    public ResponseEntity<ApiResponse<?>> getProduitsEnRupture(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType
    ) {
        Page<ProduitStockProjection> pagedProduits =
                produitStockService.getProduitsEnRupture(PageRequest.of(page - 1, size));
        List<ProduitStockResponseDTO> dtoList =
                produitMapper.toProduitStockResponseDTOs(pagedProduits.getContent());
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Produits en rupture récupérés avec succès",
                        PaginationUtil.buildPaginationMap(pagedProduits, dtoList)
                )
        );
    }
}
