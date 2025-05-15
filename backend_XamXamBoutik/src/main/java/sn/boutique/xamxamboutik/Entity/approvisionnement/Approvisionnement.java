package sn.boutique.xamxamboutik.Entity.approvisionnement;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
@Entity
@Table(name = "approvisionnements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "detailAppros")
@ToString(callSuper = true, exclude = "detailAppros")
public class Approvisionnement extends BaseEntity {
    private LocalDateTime date;
    @Column(name = "code_appro", nullable = false, unique = true)
    private String codeAppro;
    @Column(name = "montant_appro", nullable = false)
    private Double montantAppro;
    @Column(name = "frais_transport")
    private Double fraisTransport;
    @OneToMany(mappedBy = "approvisionnement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("approvisionnement")
    private Set<DetailAppro> detailAppros = new HashSet<>();
}
