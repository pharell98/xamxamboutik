package sn.boutique.xamxamboutik.Entity.statistique;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "statistiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Statistique extends BaseEntity {
    
    // CHAMPS EXISTANTS
    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;                    // Date de la journée
    
    @Column(name = "vente_journaliere")
    private Double venteJournaliere;              // Total des ventes du jour
    
    @Column(name = "total_dette_journaliere")
    private Double totalDetteJournaliere;         // Dettes du jour
    
    @Column(name = "perte_journaliere")
    private Double perteJournaliere;              // Pertes du jour
    
    @Column(name = "montant_depenser_journalier")
    private Double montantDepenserJournalier;     // Dépenses du jour
    
    @Column(name = "montant_caisse_ouverture")
    private Double montantCaisseOuverture;        // Montant à l'ouverture
    
    @Column(name = "montant_caisse_fermeture")
    private Double montantCaisseFermeture;        // Montant à la fermeture
    
    // NOUVEAUX CHAMPS POUR LA CAISSE
    @Column(name = "date_ouverture_caisse")
    private LocalDateTime dateOuvertureCaisse;    // Quand la caisse a été ouverte
    
    @Column(name = "date_fermeture_caisse")
    private LocalDateTime dateFermetureCaisse;    // Quand la caisse a été fermée
    
    @Column(name = "est_caisse_ouverte")
    private Boolean estCaisseOuverte = false;     // État actuel (true/false)
}