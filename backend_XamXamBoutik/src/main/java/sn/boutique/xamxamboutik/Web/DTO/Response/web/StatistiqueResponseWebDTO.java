package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class StatistiqueResponseWebDTO {
    @Schema(description = "Bénéfice total calculé sur la période")
    private double benefit;
}
