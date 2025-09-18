package sn.boutique.xamxamboutik.Web.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategorieRequestDTO {
    private Long id;  // Ajoutez un champ ID pour pouvoir identifier la catégorie à mettre à jour
    @NotBlank(message = "Le libellé de la catégorie est obligatoire")
    @Schema(description = "Libellé de la catégorie", example = "Électronique", required = true)
    private String libelle;
}
