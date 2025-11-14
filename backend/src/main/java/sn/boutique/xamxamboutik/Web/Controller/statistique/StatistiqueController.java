package sn.boutique.xamxamboutik.Web.Controller.statistique;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.boutique.xamxamboutik.Service.statistique.IStatistique;
import sn.boutique.xamxamboutik.Service.statistique.StatistiqueApiService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.StatistiqueMapper;
import sn.boutique.xamxamboutik.Web.DTO.Response.ApiResponse;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Statistiques", description = "API pour afficher les statistiques et KPIs de la boutique")
@RestController
@RequestMapping(value = "/", produces = "application/json")
@CrossOrigin("*")
public class StatistiqueController {
    private final IStatistique statistiqueService;
    private final StatistiqueMapper statistiqueMapper;
    private final StatistiqueApiService statistiqueApiService;

    @Autowired
    public StatistiqueController(
            IStatistique statistiqueService, 
            StatistiqueMapper statistiqueMapper,
            StatistiqueApiService statistiqueApiService
    ) {
        this.statistiqueService = statistiqueService;
        this.statistiqueMapper = statistiqueMapper;
        this.statistiqueApiService = statistiqueApiService;
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
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
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

    // ==================== NOUVEAUX ENDPOINTS DASHBOARD ====================

    @GetMapping("/statistiques/ventes/kpis-complementaires")
    @Operation(
            summary = "KPIs complémentaires du dashboard",
            description = "Retourne les KPIs qui ne sont pas dans /caisse/etat : panier moyen, nombre de ventes, produits vendus, alertes stock"
    )
    public ResponseEntity<ApiResponse<KpisComplementairesDTO>> getKpisComplementaires(
            @Parameter(description = "Période : today, 7days, month, year", example = "today")
            @RequestParam(defaultValue = "today") String period
    ) {
        KpisComplementairesDTO kpis = statistiqueApiService.getKpisComplementaires(period);
        return ResponseEntity.ok(
                ApiResponse.success("KPIs complémentaires récupérés avec succès", kpis)
        );
    }

    @GetMapping("/statistiques/ventes/by-payment-mode")
    @Operation(
            summary = "Répartition des ventes par mode de paiement",
            description = "Retourne la répartition des montants et pourcentages par mode de paiement pour une période donnée"
    )
    public ResponseEntity<ApiResponse<List<PaymentModeStatDTO>>> getPaymentModeBreakdown(
            @Parameter(description = "Période : today, 7days, month, year", example = "today")
            @RequestParam(defaultValue = "today") String period
    ) {
        List<PaymentModeStatDTO> breakdown = statistiqueApiService.getPaymentModeBreakdown(period);
        return ResponseEntity.ok(
                ApiResponse.success("Répartition par mode de paiement récupérée avec succès", breakdown)
        );
    }

    @GetMapping("/statistiques/ventes/evolution-ca")
    @Operation(
            summary = "Évolution du chiffre d'affaires",
            description = "Retourne l'évolution jour par jour du CA, bénéfice et nombre de ventes sur les N derniers jours"
    )
    public ResponseEntity<ApiResponse<List<SalesEvolutionDTO>>> getSalesEvolution(
            @Parameter(description = "Nombre de jours (ex: 7, 15, 30)", example = "7")
            @RequestParam(defaultValue = "7") int days
    ) {
        List<SalesEvolutionDTO> evolution = statistiqueApiService.getSalesEvolution(days);
        return ResponseEntity.ok(
                ApiResponse.success("Évolution des ventes récupérée avec succès", evolution)
        );
    }
}