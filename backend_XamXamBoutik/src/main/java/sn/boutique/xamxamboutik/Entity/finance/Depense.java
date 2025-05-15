package sn.boutique.xamxamboutik.Entity.finance;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;

import java.time.LocalDateTime;
@Entity
@Table(name = "depenses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Depense extends BaseEntity {
    @NotNull
    @Column(nullable = false)
    private LocalDateTime date;
    @NotNull
    @Positive
    @Column(nullable = false)
    private Double montant;
    @NotBlank
    @Column(nullable = false)
    private String description;
}
