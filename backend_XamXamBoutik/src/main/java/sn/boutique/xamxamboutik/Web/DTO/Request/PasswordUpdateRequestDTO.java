package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordUpdateRequestDTO {
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Schema(description = "Nouveau mot de passe de l'utilisateur", example = "newpassword123", required = true)
    private String newPassword;
}