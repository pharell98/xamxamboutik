package sn.boutique.xamxamboutik.Entity.vente;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Entity.client.Client;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "ventes",
        indexes = {
                @Index(name = "idx_vente_date", columnList = "date"),
                @Index(name = "idx_vente_client_id", columnList = "client_id")
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"detailVentes", "paiement"})
@ToString(callSuper = true, exclude = {"detailVentes", "paiement"})
@NoArgsConstructor
@AllArgsConstructor
public class Vente extends BaseEntity {
    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;

    @NotNull
    @Column(name = "montant_total", nullable = false)
    private Double montantTotal;

    @Column(name = "montant_restant")
    private Double montantRestant;

    @Column(name = "est_credit")
    private Boolean estCredit = false;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL)
    private Set<DetailVente> detailVentes = new HashSet<>();

    @OneToOne(mappedBy = "vente", cascade = CascadeType.ALL)
    private Paiement paiement;
}