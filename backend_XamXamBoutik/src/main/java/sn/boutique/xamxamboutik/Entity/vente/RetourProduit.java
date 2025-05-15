package sn.boutique.xamxamboutik.Entity.vente;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "retour_produits")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class RetourProduit extends BaseEntity {
    @NotNull
    @Column(name = "date_retour", nullable = false)
    private LocalDateTime dateRetour;

    @NotBlank
    private String motif;

    @NotBlank
    @Column(name = "type_retour", nullable = false)
    private String typeRetour;

    @OneToOne
    @JoinColumn(name = "detail_vente_id", nullable = false)
    private DetailVente detailVente;
}