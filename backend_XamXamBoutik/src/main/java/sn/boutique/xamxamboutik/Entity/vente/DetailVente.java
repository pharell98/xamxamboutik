package sn.boutique.xamxamboutik.Entity.vente;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;

@Entity
@Table(
        name = "detail_ventes",
        indexes = {
                @Index(name = "idx_detail_ventes_vente_id", columnList = "vente_id"),
                @Index(name = "idx_detail_ventes_produit_id", columnList = "produit_id"),
                @Index(name = "idx_detail_ventes_montant_total", columnList = "montant_total")
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = "vente")
@ToString(callSuper = true, exclude = "vente")
@NoArgsConstructor
@AllArgsConstructor
public class DetailVente extends BaseEntity {
    @NotNull
    @Column(name = "prix_vente", nullable = false)
    private Double prixVente;

    @NotNull
    @Column(name = "quantite_vendu", nullable = false)
    private Integer quantiteVendu;

    @NotNull
    @Column(name = "montant_total", nullable = false)
    private Double montantTotal;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusDetailVente status = StatusDetailVente.VENDU;

    @ManyToOne
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;
}