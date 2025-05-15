package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import sn.boutique.xamxamboutik.Enums.Role;

@Data
public class UserResponseDTO {
    @Schema(description = "ID unique de l'utilisateur", example = "1")
    private Long id;

    @Schema(description = "Nom complet de l'utilisateur", example = "Jean Dupont")
    private String nom;

    @Schema(description = "Login unique de l'utilisateur", example = "jdupont")
    private String login;

    @Schema(description = "Rôle de l'utilisateur", example = "GESTIONNAIRE")
    private Role role;

    @Schema(description = "Indique si l'utilisateur est supprimé (soft delete)", example = "false")
    private boolean deleted;
}