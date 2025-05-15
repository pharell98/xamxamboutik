package sn.boutique.xamxamboutik.Entity.utilisateur;
import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import sn.boutique.xamxamboutik.Enums.Role;

@Entity
@Table(name = "utilisateurs")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur extends BaseEntity {
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;
    @NotBlank(message = "Le login est obligatoire")
    @Column(nullable = false, unique = true)
    private String login;
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}