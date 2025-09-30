package sn.boutique.xamxamboutik.Web.Controller.produit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitStockProjection;
import sn.boutique.xamxamboutik.Service.produit.ProduitStockService;
import sn.boutique.xamxamboutik.Util.PaginationUtil;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitMapper;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitStockResponseDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "ProduitStock", description = "API pour la gestion des produits en rupture de stock")
@RestController
@RequestMapping(produces = "application/json")
@CrossOrigin("*")
public class ProduitStockController {
    
    private static final Logger logger = LoggerFactory.getLogger(ProduitStockController.class);
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
            description = "Retourne la liste paginée des produits dont le stock est inférieur ou égal au seuil de rupture défini."
    )
    public ResponseEntity<ApiResponse<?>> getProduitsEnRupture(
            @Parameter(description = "Numéro de page (commence à 1)", example = "1")
            @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "Taille de la page", example = "10")
            @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "Type de client (web/mobile)", example = "web")
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType
    ) {
        try {
            logger.debug("Récupération des produits en rupture - page: {}, size: {}, clientType: {}", 
                        page, size, clientType);
            
            Page<ProduitStockProjection> pagedProduits =
                    produitStockService.getProduitsEnRupture(PageRequest.of(page - 1, size));
            
            if (pagedProduits.isEmpty()) {
                logger.info("Aucun produit en rupture de stock trouvé");
                return ResponseEntity.ok(
                        ApiResponse.success(
                                "Aucun produit en rupture de stock",
                                PaginationUtil.buildPaginationMap(pagedProduits, List.of())
                        )
                );
            }
            
            List<ProduitStockResponseDTO> dtoList =
                    produitMapper.toProduitStockResponseDTOs(pagedProduits.getContent());
            
            logger.info("Produits en rupture trouvés: {} sur {} total", 
                       pagedProduits.getNumberOfElements(), pagedProduits.getTotalElements());
            
            return ResponseEntity.ok(
                    ApiResponse.success(
                            String.format("Produits en rupture récupérés avec succès (%d trouvés)", 
                                         pagedProduits.getTotalElements()),
                            PaginationUtil.buildPaginationMap(pagedProduits, dtoList)
                    )
            );
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des produits en rupture", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Erreur lors de la récupération des produits en rupture: " + e.getMessage()));
        }
    }

    @GetMapping("/stock/rupture/count")
    @Operation(
            summary = "Compter les produits en rupture de stock",
            description = "Retourne le nombre total de produits en rupture de stock."
    )
    public ResponseEntity<ApiResponse<Map<String, Object>>> countProduitsEnRupture() {
        try {
            logger.debug("Comptage des produits en rupture de stock");
            
            long count = produitStockService.countProduitsEnRupture();
            
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            result.put("hasRupture", count > 0);
            
            String message = count > 0 
                    ? String.format("%d produit(s) en rupture de stock", count)
                    : "Aucun produit en rupture de stock";
            
            logger.info("Nombre de produits en rupture: {}", count);
            
            return ResponseEntity.ok(ApiResponse.success(message, result));
        } catch (Exception e) {
            logger.error("Erreur lors du comptage des produits en rupture", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Erreur lors du comptage: " + e.getMessage()));
        }
    }
}
