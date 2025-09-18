package sn.boutique.xamxamboutik.Entity.vente;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Enums.ModePaiement;

import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "vente")
@ToString(callSuper = true, exclude = "vente")
@NoArgsConstructor
@AllArgsConstructor
public class Paiement extends BaseEntity {

    @NotNull
    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;

    @NotNull(message = "Le montant versé est requis")
    @Column(name = "montant_verser", nullable = false)
    private Double montantVerser;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false)
    private ModePaiement modePaiement = ModePaiement.ESPECE;

    @ManyToOne
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;
}