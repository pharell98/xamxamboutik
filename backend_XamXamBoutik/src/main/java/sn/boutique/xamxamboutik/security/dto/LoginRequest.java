package sn.boutique.xamxamboutik.security.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serial;
import java.io.Serializable;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO pour la demande de connexion")
public class LoginRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @NotBlank(message = "Le login est obligatoire")
    @Size(min = 3, max = 50, message = "Le login doit contenir entre 3 et 50 caractères")
    @Pattern(regexp = "^[a-zA-Z0-9._-]*$", message = "Le login ne doit contenir que des lettres, chiffres et les caractères ._-")
    @Schema(
            description = "Login de l'utilisateur",
            example = "admin",
            required = true,
            minLength = 3,
            maxLength = 50
    )
    private String login;
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    @Schema(
            description = "Mot de passe de l'utilisateur",
            example = "admin123",
            required = true,
            minLength = 6,
            format = "password"
    )
    private String password;
    @Override
    public String toString() {
        return "LoginRequest{login='" + login + "'}";  // Ne pas inclure le mot de passe dans les logs
    }
}
