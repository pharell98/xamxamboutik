package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ParametrageRequestDTO {

    @NotBlank(message = "Le nom de la boutique est obligatoire")
    @Schema(description = "Nom de la boutique", example = "Ma Boutique", required = true)
    private String shopName;

    @Schema(description = "URL du logo si useImageURL=true", example = "https://exemple.com/logo.jpg")
    private String imageURL;

    @Schema(description = "Indique si le logo doit être renseigné via une URL", example = "true")
    private Boolean useImageURL;

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "L'adresse e-mail doit être valide")
    @Schema(description = "Adresse e-mail de contact", example = "contact@maboutique.com", required = true)
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Le numéro de téléphone doit être valide")
    @Schema(description = "Numéro de téléphone", example = "+1234567890", required = true)
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

    @Schema(description = "ID du paramétrage (pour la mise à jour)", example = "1")
    private Long id;
}