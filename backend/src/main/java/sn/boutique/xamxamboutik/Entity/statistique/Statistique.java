package sn.boutique.xamxamboutik.Entity.statistique;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import java.time.LocalDateTime;
@Entity
@Table(name = "statistiques")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Statistique extends BaseEntity {
    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;
    @Column(name = "vente_journaliere")
    private Double venteJournaliere;
    @Column(name = "total_dette_journaliere")
    private Double totalDetteJournaliere;
    @Column(name = "perte_journaliere")
    private Double perteJournaliere;
    @Column(name = "montant_depenser_journalier")
    private Double montantDepenserJournalier;
    @Column(name = "montant_caisse_ouverture")
    private Double montantCaisseOuverture;
    @Column(name = "montant_caisse_fermeture")
    private Double montantCaisseFermeture;
}