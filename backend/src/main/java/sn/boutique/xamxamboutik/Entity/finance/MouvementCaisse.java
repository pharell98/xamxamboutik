package sn.boutique.xamxamboutik.Entity.finance;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Enums.TypeMouvement;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "mouvements_caisse",
        indexes = {
                @Index(name = "idx_mouvement_caisse_id", columnList = "caisse_id"),
                @Index(name = "idx_mouvement_date", columnList = "date_mouvement"),
                @Index(name = "idx_mouvement_type", columnList = "type_mouvement"),
                @Index(name = "idx_mouvement_date_type", columnList = "date_mouvement, type_mouvement")
        }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"caisse", "vente", "depense"})
@ToString(callSuper = true, exclude = {"caisse", "vente", "depense"})
@NoArgsConstructor
@AllArgsConstructor
public class MouvementCaisse extends BaseEntity {
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_mouvement", nullable = false)
    private TypeMouvement typeMouvement;
    
    @NotNull
    @Column(name = "montant", nullable = false)
    private Double montant;
    
    @NotNull
    @Column(name = "date_mouvement", nullable = false)
    private LocalDateTime dateMouvement;
    
    @Column(name = "reference_externe")
    private String referenceExterne;
    
    @Column(name = "solde_avant")
    private Double soldeAvant;
    
    @Column(name = "solde_apres")
    private Double soldeApres;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caisse_id", nullable = false)
    private Caisse caisse;
    
    // Relations optionnelles pour traçabilité
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id")
    private Vente vente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depense_id")
    private Depense depense;
}