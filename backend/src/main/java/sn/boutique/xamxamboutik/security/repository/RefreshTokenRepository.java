package sn.boutique.xamxamboutik.security.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.security.model.RefreshToken;
import java.util.Optional;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteAllByUser(Utilisateur user);
}
