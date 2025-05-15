package sn.boutique.xamxamboutik.Web.Controller.vente;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Enums.ModePaiement;
import sn.boutique.xamxamboutik.Service.vente.IVenteService;
import sn.boutique.xamxamboutik.Service.vente.VenteService;
import sn.boutique.xamxamboutik.Web.DTO.Request.VenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.VenteJourResponseDTO;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Ventes", description = "API de gestion des ventes")
@RestController
@RequestMapping("/ventes")
@CrossOrigin("*")
public class VenteController {
    private final IVenteService venteService;
    private final VenteService concreteVenteService;

    public VenteController(IVenteService venteService, VenteService concreteVenteService) {
        this.venteService = venteService;
        this.concreteVenteService = concreteVenteService;
    }

    @PostMapping
    @Operation(summary = "Créer une vente")
    public ResponseEntity<ApiResponse<Void>> createVente(@Valid @RequestBody VenteRequestDTO dto) {
        venteService.createVente(dto);
        return ResponseEntity.ok(ApiResponse.success("Vente créée avec succès", null));
    }

    @GetMapping("/produits")
    @Operation(summary = "Liste paginée de tous les produits triés par ventes, y compris sans ventes")
    public ResponseEntity<ApiResponse<Page<?>>> getAllProductsBySales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestHeader(value = "X-Client-Type", defaultValue = "web") String clientType
    ) {
        Page<?> resultPage = concreteVenteService.getAllProductsBySalesPage(
                clientType,
                PageRequest.of(page - 1, size)
        );
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tous les produits triés par ventes (desc)",
                        resultPage
                )
        );
    }

    @GetMapping("/today")
    @Operation(summary = "Récupérer la liste paginée des ventes du jour en cours")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTodaySales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        Page<VenteJourResponseDTO> ventesDuJour = concreteVenteService.getTodaySales(PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getTodaySalesTotalAmount(minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste paginée des ventes d'aujourd'hui récupérée avec succès",
                        buildResponseMap(ventesDuJour, concreteVenteService.getTotalAmount(ventesDuJour), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/last7days")
    @Operation(summary = "Récupérer la liste paginée des ventes sur les 7 derniers jours")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLast7DaysSales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        Page<VenteJourResponseDTO> ventes7Jours = concreteVenteService.getLast7DaysSales(PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getLast7DaysSalesTotalAmount(minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste paginée des ventes sur les 7 derniers jours récupérée avec succès",
                        buildResponseMap(ventes7Jours, concreteVenteService.getTotalAmount(ventes7Jours), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/current-month")
    @Operation(summary = "Récupérer la liste paginée des ventes du mois en cours")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentMonthSales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        Page<VenteJourResponseDTO> ventesMois = concreteVenteService.getMonthSales(PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getMonthSalesTotalAmount(minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste paginée des ventes du mois en cours récupérée avec succès",
                        buildResponseMap(ventesMois, concreteVenteService.getTotalAmount(ventesMois), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/current-year")
    @Operation(summary = "Récupérer la liste paginée des ventes de l'année en cours")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentYearSales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        Page<VenteJourResponseDTO> ventesAnnee = concreteVenteService.getYearSales(PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getYearSalesTotalAmount(minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste paginée des ventes de l'année en cours récupérée avec succès",
                        buildResponseMap(ventesAnnee, concreteVenteService.getTotalAmount(ventesAnnee), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/by-date")
    @Operation(summary = "Récupérer la liste paginée des ventes pour une date donnée (ex: 2025-04-03)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesByExactDate(
            @RequestParam("date") String dateStr,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        Page<VenteJourResponseDTO> result = concreteVenteService.getSalesByExactDate(localDate, PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getSalesByExactDateTotalAmount(localDate, minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Ventes pour la date " + dateStr,
                        buildResponseMap(result, concreteVenteService.getTotalAmount(result), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/all")
    @Operation(summary = "Récupérer la liste paginée de toutes les ventes sans restriction de date")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllSales(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount
    ) {
        Page<VenteJourResponseDTO> result = concreteVenteService.getAllSales(PageRequest.of(page - 1, size), minAmount, maxAmount);
        double totalPeriodAmount = concreteVenteService.getAllSalesTotalAmount(minAmount, maxAmount);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Liste paginée de toutes les ventes récupérée avec succès",
                        buildResponseMap(result, concreteVenteService.getTotalAmount(result), totalPeriodAmount)
                )
        );
    }

    @GetMapping("/paiementModes")
    @Operation(summary = "Obtenir la liste des modes de paiement disponibles")
    public ResponseEntity<ApiResponse<List<String>>> getModesPaiement() {
        List<String> modes = Arrays.stream(ModePaiement.values())
                .map(ModePaiement::getKey)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Liste des modes de paiement", modes));
    }

    private Map<String, Object> buildResponseMap(Page<VenteJourResponseDTO> page, double pageTotalAmount, double totalPeriodAmount) {
        Map<String, Object> response = new HashMap<>();
        response.put("content", page.getContent());
        response.put("pageNumber", page.getNumber() + 1);
        response.put("totalPages", page.getTotalPages());
        response.put("pageSize", page.getSize());
        response.put("totalElements", page.getTotalElements());
        response.put("pageTotalAmount", pageTotalAmount);
        response.put("totalAmount", totalPeriodAmount);
        return response;
    }
}