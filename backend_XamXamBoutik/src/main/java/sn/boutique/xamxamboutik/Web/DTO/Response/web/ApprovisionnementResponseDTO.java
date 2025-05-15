package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ApprovisionnementResponseDTO {
    @Schema(description = "ID unique de l'approvisionnement", example = "1")
    private Long id;
    @Schema(description = "Code de l'approvisionnement", example = "APPRO-001")
    private String codeAppro;
    @Schema(description = "Montant de l'approvisionnement", example = "1500.0")
    private Double montantAppro;
    @Schema(description = "Frais de transport de l'approvisionnement", example = "50.0")
    private Double fraisTransport;
    @Schema(description = "Date de l'approvisionnement", example = "27-01-2025 12:34")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm", locale = "fr")
    private LocalDateTime date;
}
