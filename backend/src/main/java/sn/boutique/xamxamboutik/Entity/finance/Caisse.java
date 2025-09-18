package sn.boutique.xamxamboutik.Entity.finance;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Enums.TypeCaisse;

import java.time.LocalDateTime;

@Entity
@Table(name = "caisses", indexes = {
    @Index(name = "idx_caisse_type", columnList = "type_caisse"),
    @Index(name = "idx_caisse_utilisateur", columnList = "utilisateur_id"),
    @Index(name = "idx_caisse_active", columnList = "est_active")
})
public class Caisse extends BaseEntity {
    
    // EXISTANT
    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double solde;
    
    // NOUVEAUX CHAMPS
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_caisse", nullable = false)
    private TypeCaisse typeCaisse; // GLOBALE, UTILISATEUR
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id") // NULL pour caisse globale
    private Utilisateur utilisateur;
    
    @Column(name = "nom_caisse", nullable = false)
    private String nomCaisse;
    
    @Column(name = "est_active")
    private Boolean estActive = true;
    
    @Column(name = "solde_ouverture_jour")
    private Double soldeOuvertureJour = 0.0;
    
    @Column(name = "date_derniere_ouverture")
    private LocalDateTime dateDerniereOuverture;
}