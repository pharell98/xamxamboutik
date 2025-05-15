package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ParametrageResponseWebDTO {

    @Schema(description = "ID unique du paramétrage", example = "1")
    private Long id;

    @Schema(description = "Nom de la boutique", example = "Ma Boutique")
    private String shopName;

    @Schema(description = "URL du logo", example = "https://exemple.com/logo.jpg")
    private String logo;

    @Schema(description = "Adresse e-mail de contact", example = "contact@maboutique.com")
    private String email;

    @Schema(description = "Numéro de téléphone", example = "+1234567890")
    private String phone;

    @Schema(description = "Pays", example = "France")
    private String country;

    @Schema(description = "Région", example = "Île-de-France")
    private String region;

    @Schema(description = "Département", example = "Paris")
    private String department;

    @Schema(description = "Quartier", example = "Le Marais")
    private String neighborhood;

    @Schema(description = "Rue", example = "123 Rue Principale")
    private String street;

    @Schema(description = "URL Facebook", example = "https://facebook.com/maboutique")
    private String facebookUrl;

    @Schema(description = "URL Instagram", example = "https://instagram.com/maboutique")
    private String instagramUrl;

    @Schema(description = "URL Twitter", example = "https://twitter.com/maboutique")
    private String twitterUrl;

    @Schema(description = "URL du site web", example = "https://www.maboutique.com")
    private String websiteUrl;

    @Schema(description = "Indique si le paramétrage est supprimé (soft delete)", example = "false")
    private boolean deleted;
}