package sn.boutique.xamxamboutik.Web.DTO.Request;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
@Data
public class ProduitRequestDTO {
    @NotBlank(message = "Le code produit est obligatoire")
    @Schema(description = "Code unique du produit", example = "PRD12345 ou 1234653223", required = true)
    private String codeProduit;
    @Schema(description = "Ancien champ image (upload). Ignoré si useImageURL=true", example = "image.jpg")
    private String image;
    @Schema(description = "URL de l'image si useImageURL=true", example = "https://exemple.com/image.jpg")
    private String imageURL;
    @Schema(description = "Indique si l'image doit être renseignée via une URL", example = "true")
    private Boolean useImageURL;
    @NotBlank(message = "Le libellé du produit est obligatoire")
    @Schema(description = "Libellé du produit", example = "Ordinateur portable", required = true)
    private String libelle;
    @NotNull(message = "Le prix de vente est obligatoire")
    @Positive(message = "Le prix de vente doit être un nombre positif")
    @Schema(description = "Prix de vente du produit", example = "599.99", required = true)
    private Double prixVente;
    @NotNull(message = "Le prix d'achat est obligatoire")
    @Positive(message = "Le prix d'achat doit être un nombre positif")
    @Schema(description = "Prix d'achat du produit", example = "500.99", required = true)
    private Double prixAchat;
    @NotNull(message = "La quantité de stock est obligatoire")
    @Min(value = 0, message = "Le stock ne peut pas être négatif")
    @Schema(description = "Quantité de stock disponible", example = "50", required = true)
    private Integer stockDisponible;
    @Min(value = 0, message = "Le seuil de rupture ne peut pas être négatif")
    @Schema(description = "Seuil de rupture de stock", example = "10")
    private Integer seuilRuptureStock;
    @NotNull(message = "L'ID de la catégorie est obligatoire")
    @Schema(description = "ID de la catégorie associée au produit", example = "1", required = true)
    private Long categorieId;
    @Schema(description = "Nom de la catégorie (utilisé uniquement lors de l'import Excel)")
    private String categorieName;
    @Schema(description = "ID du produit (pour la mise à jour)", example = "1")
    private Long id;
}
