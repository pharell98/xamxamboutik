package sn.boutique.xamxamboutik.security.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Set;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse contenant les informations du token")
public class TokenResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    @Schema(
            description = "Token d'accès JWT",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            required = true
    )
    @JsonProperty("access_token")
    private String accessToken;
    @Schema(
            description = "Token de rafraîchissement JWT",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            required = true
    )
    @JsonProperty("refresh_token")
    private String refreshToken;
    @Schema(
            description = "Type du token",
            example = "Bearer",
            required = true,
            defaultValue = "Bearer"
    )
    @JsonProperty("token_type")
    private String tokenType;
    @Schema(
            description = "Durée de validité du token en secondes",
            example = "1800",
            required = true
    )
    @JsonProperty("expires_in")
    private Long expiresIn;
    @Schema(
            description = "Informations additionnelles sur l'utilisateur",
            required = false
    )
    @JsonProperty("user_info")
    private UserInfo userInfo;
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String username;
        private Set<String> roles;
    }
}
