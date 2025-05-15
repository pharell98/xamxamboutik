package sn.boutique.xamxamboutik.Entity.finance;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;

@Entity
@Table(name = "caisses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Caisse extends BaseEntity {
    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double solde;
}
