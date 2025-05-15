package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sn.boutique.xamxamboutik.Enums.Role;

@Data
public class UserRequestDTO {
    @Schema(description = "ID de l'utilisateur (pour la mise à jour)", example = "1")
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Schema(description = "Nom complet de l'utilisateur", example = "Jean Dupont", required = true)
    private String nom;

    @NotBlank(message = "Le login est obligatoire")
    @Schema(description = "Login unique de l'utilisateur", example = "jdupont", required = true)
    private String login;

    @Schema(description = "Mot de passe de l'utilisateur (obligatoire pour la création)", example = "password123")
    private String password;

    @NotNull(message = "Le rôle est obligatoire")
    @Schema(description = "Rôle de l'utilisateur", example = "GESTIONNAIRE", required = true)
    private Role role;
}