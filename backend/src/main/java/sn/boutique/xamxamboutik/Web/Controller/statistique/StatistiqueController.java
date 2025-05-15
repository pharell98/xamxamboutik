package sn.boutique.xamxamboutik.Web.Controller.statistique;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.statistique.IStatistique;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.StatistiqueMapper;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.StatistiqueResponseWebDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Statistiques", description = "API pour afficher les bénéfices de la boutique")
@RestController
@RequestMapping(value = "/api/v1", produces = "application/json")
@CrossOrigin("*")
public class StatistiqueController {
    private final IStatistique statistiqueService;
    private final StatistiqueMapper statistiqueMapper;

    @Autowired
    public StatistiqueController(IStatistique statistiqueService, StatistiqueMapper statistiqueMapper) {
        this.statistiqueService = statistiqueService;
        this.statistiqueMapper = statistiqueMapper;
    }

    @GetMapping("/statistiques/benefice/cumulatif")
    @Operation(summary = "Bénéfice cumulatif", description = "Retourne le bénéfice total depuis le début de l'activité")
    public ResponseEntity<ApiResponse<StatistiqueResponseWebDTO>> getCumulativeBenefit() {
        double benefit = statistiqueService.getCumulativeBenefit();
        StatistiqueResponseWebDTO dto = statistiqueMapper.toDTO(benefit);
        return ResponseEntity.ok(ApiResponse.success("Bénéfice cumulatif récupéré avec succès", dto));
    }

    @GetMapping("/statistiques/benefice")
    @Operation(summary = "Bénéfice sur une période", description = "Retourne le bénéfice total entre deux dates (incluses)")
    public ResponseEntity<ApiResponse<StatistiqueResponseWebDTO>> getBenefitBetweenDates(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        double benefit = statistiqueService.getBenefitBetweenDates(startDateTime, endDateTime);
        StatistiqueResponseWebDTO dto = statistiqueMapper.toDTO(benefit);
        return ResponseEntity.ok(ApiResponse.success("Bénéfice sur la période récupéré avec succès", dto));
    }

    @GetMapping("/statistiques/sales-dates")
    @Operation(summary = "Récupérer les dates de la première et dernière vente",
            description = "Retourne les dates de la première et dernière vente effectuées")
    public ResponseEntity<ApiResponse<Map<String, LocalDateTime>>> getSalesDateRange() {
        LocalDateTime firstSaleDate = statistiqueService.getFirstSaleDate();
        LocalDateTime lastSaleDate = statistiqueService.getLastSaleDate();

        Map<String, LocalDateTime> dateRange = new HashMap<>();
        dateRange.put("firstSaleDate", firstSaleDate);
        dateRange.put("lastSaleDate", lastSaleDate);

        return ResponseEntity.ok(
                ApiResponse.success("Dates des ventes récupérées avec succès", dateRange)
        );
    }
}