package sn.boutique.xamxamboutik.Entity.approvisionnement;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
@Entity
@Table(name = "detail_appros")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "approvisionnement")
@ToString(callSuper = true, exclude = "approvisionnement")
public class DetailAppro extends BaseEntity {
    @Column(name = "prix_achat", nullable = false)
    private Double prixAchat;
    @Column(name = "quantite_achat", nullable = false)
    private Integer quantiteAchat;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approvisionnement_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler","detailAppros"})
    private Approvisionnement approvisionnement;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;
}
