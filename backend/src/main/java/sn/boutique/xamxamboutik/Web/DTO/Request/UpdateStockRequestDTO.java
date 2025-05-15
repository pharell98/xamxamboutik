package sn.boutique.xamxamboutik.Web.DTO.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStockRequestDTO {
    @NotNull(message = "L'ID du produit est obligatoire")
    private Long produitId;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = -100000, message = "La quantité ne peut pas être inférieure à -100000")
    private Integer quantite; // Positif pour ajout, négatif pour retrait

    private Double prixAchat; // Optionnel, pour recalculer le CMA
}