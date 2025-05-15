package sn.boutique.xamxamboutik.Repository.produit;


import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.lang.NonNull;
import sn.boutique.xamxamboutik.Entity.produit.Categorie;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;

import java.util.Optional;

public interface CategorieRepository extends SoftDeleteRepository<Categorie, Long> {
    @Override
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Categorie> findAll(@NonNull Pageable pageable);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findAllProjectedBy(Pageable pageable, Class<T> type);

    default <T> Page<T> findAll(Pageable pageable, Class<T> type) {
        return findAllProjectedBy(pageable, type);
    }

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Categorie> findByLibelleContainingIgnoreCase(String libelle, Pageable pageable);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByLibelleContainingIgnoreCase(String libelle, Pageable pageable, Class<T> type);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Categorie> findByLibelleStartingWithIgnoreCase(String libelle, Pageable pageable);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByLibelleStartingWithIgnoreCase(String libelle, Pageable pageable, Class<T> type);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    boolean existsByLibelleAndDeletedFalse(String libelle);

    @Query("SELECT COUNT(p) FROM Produit p WHERE p.categorie.id = ?1")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    long countProduitsByCategorie(Long id);

    @Query("SELECT c FROM Categorie c WHERE c.deleted = true")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Categorie> findAllDeleted(Pageable pageable);

    @Query("UPDATE Categorie c SET c.deleted = false, c.deletedAt = NULL WHERE c.id = ?1")
    void restore(Long id);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Optional<Categorie> findByLibelle(String libelle);

    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Optional<Categorie> findByLibelleIgnoreCase(String libelle);
}