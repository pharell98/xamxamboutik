package sn.boutique.xamxamboutik.Web.DTO.Response;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
public class ApiResponse<T> {
    @Schema(description = "Indique si l'opération a réussi ou non", example = "true")
    private boolean success;
    @Schema(description = "Message décrivant le résultat de l'opération", example = "Opération réussie")
    private String message;
    @Schema(description = "Les données renvoyées par l'API")
    private T data;
    @Schema(description = "Horodatage de la réponse", example = "2025-01-27T12:34:56")
    private LocalDateTime timestamp;
    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);  // Passer null pour les données dans le cas d'une erreur
    }
}
