package sn.boutique.xamxamboutik.Repository.utilisateur;

import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends SoftDeleteRepository<Utilisateur, Long> {
    @Query("SELECT u FROM Utilisateur u WHERE u.deleted = false")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Utilisateur> findAllActive(Pageable pageable);

    @Query("SELECT u FROM Utilisateur u WHERE u.deleted = true")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Utilisateur> findAllDeleted(Pageable pageable);

    @Query("SELECT u FROM Utilisateur u WHERE u.deleted = false")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findAllProjectedBy(Pageable pageable, Class<T> type);

    @Query("SELECT u FROM Utilisateur u WHERE u.deleted = true")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByDeletedTrue(Pageable pageable, Class<T> type);

    Optional<Utilisateur> findByLogin(String login);

    boolean existsByLogin(String login); // Ajout de la méthode
}