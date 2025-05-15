package sn.boutique.xamxamboutik.Entity.produit;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "produits",
        indexes = {
                @Index(name = "idx_produit_libelle", columnList = "libelle"),
                @Index(name = "idx_produit_codeProduit", columnList = "codeProduit"),
                @Index(name = "idx_produit_categorie_id", columnList = "categorie_id"),
                @Index(name = "idx_produit_stockDisponible", columnList = "stockDisponible"),
                @Index(name = "idx_produit_deleted", columnList = "deleted")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Produit extends BaseEntity {
    @NotBlank(message = "Le code produit est obligatoire")
    @Column(nullable = false, unique = true)
    private String codeProduit;

    @Lob
    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    @NotBlank(message = "Le libellé est obligatoire")
    @Column(nullable = false, unique = true)
    private String libelle;

    @Column(nullable = false)
    private Double prixVente;

    @Column(nullable = false)
    private Double prixAchat;

    @Column(nullable = false)
    private Double coupMoyenAcquisition;

    @Column(nullable = false)
    private Integer stockDisponible;

    private Integer seuilRuptureStock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "produits"})
    private Categorie categorie;
}