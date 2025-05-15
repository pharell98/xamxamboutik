package sn.boutique.xamxamboutik.Web.DTO.Response.web;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class CategorieResponseDTO {
    @Schema(description = "ID unique de la catégorie", example = "1")
    private Long id;
    @Schema(description = "Libellé de la catégorie", example = "Électronique")
    private String libelle;
    @Schema(description = "Indique si la catégorie est supprimée (soft delete)", example = "false")
    private boolean deleted;
}
