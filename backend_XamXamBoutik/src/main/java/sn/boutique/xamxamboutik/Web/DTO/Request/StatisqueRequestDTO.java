package sn.boutique.xamxamboutik.Web.DTO.Request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class StatisqueRequestDTO {
    @NotNull
    private LocalDateTime startDate;
    @NotNull
    private LocalDateTime endDate;
}
