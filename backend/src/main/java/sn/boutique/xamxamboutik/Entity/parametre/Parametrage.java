package sn.boutique.xamxamboutik.Entity.parametrage;

import sn.boutique.xamxamboutik.Entity.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "parametrages",
        indexes = {
                @Index(name = "idx_parametrage_shopName", columnList = "shopName"),
                @Index(name = "idx_parametrage_email", columnList = "email")
        }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Parametrage extends BaseEntity {

    @NotBlank(message = "Le nom de la boutique est obligatoire")
    @Column(nullable = false, unique = true)
    private String shopName;

    @Lob
    @Column(name = "logo", columnDefinition = "TEXT")
    private String logo;

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "L'adresse e-mail doit être valide")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Column(nullable = false)
    private String phone;

    @Column
    private String country;

    @Column
    private String region;

    @Column
    private String department;

    @Column
    private String neighborhood;

    @Column
    private String street;

    @Column
    private String facebookUrl;

    @Column
    private String instagramUrl;

    @Column
    private String twitterUrl;

    @Column
    private String websiteUrl;
}