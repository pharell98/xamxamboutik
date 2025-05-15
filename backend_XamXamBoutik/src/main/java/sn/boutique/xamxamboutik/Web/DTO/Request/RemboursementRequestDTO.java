package sn.boutique.xamxamboutik.Web.DTO.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import sn.boutique.xamxamboutik.Enums.TypeRetour;

@Data
public class RemboursementRequestDTO {
    @NotNull(message = "ID du détail de vente requis")
    private Long detailVenteId;

    @NotBlank(message = "Motif de remboursement requis")
    private String motif;

    @Min(value = 1, message = "Quantité de retour doit être supérieure à 0")
    private int quantiteRetour;

    private TypeRetour sousType;
}