package sn.boutique.xamxamboutik.Entity.client;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import java.util.HashSet;
import java.util.Set;
@Entity
@Table(name = "clients")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Client extends BaseEntity {
    @NotBlank(message = "Le nom complet est obligatoire")
    @Column(nullable = false)
    private String nomComplet;
    @Column(unique = true)
    private String telephone;
    @Column(name = "montant_du")
    private Double montantDu;
    @OneToMany(mappedBy = "client")
    private Set<Vente> ventes = new HashSet<>();
}