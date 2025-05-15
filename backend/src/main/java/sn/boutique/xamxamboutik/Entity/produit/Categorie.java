package sn.boutique.xamxamboutik.Entity.produit;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "categories",
        indexes = {
                @Index(name = "idx_categorie_libelle", columnList = "libelle"),
                @Index(name = "idx_categorie_deleted", columnList = "deleted")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "produits"})
public class Categorie extends BaseEntity {
    @NotBlank(message = "Le libellé est obligatoire")
    @Column(nullable = false, unique = true)
    private String libelle;

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private Set<Produit> produits = new HashSet<>();
}