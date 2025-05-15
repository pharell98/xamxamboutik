package sn.boutique.xamxamboutik.security.model;
import jakarta.persistence.*;
import lombok.*;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import java.time.LocalDateTime;
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 512)
    private String token;
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;
}
