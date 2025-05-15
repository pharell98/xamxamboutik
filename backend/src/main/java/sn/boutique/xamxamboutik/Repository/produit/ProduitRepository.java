package sn.boutique.xamxamboutik.Repository.produit;

import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Repository.Projection.ProductVenteProjection;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitStockProjection;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;

import java.util.Optional;

@Repository
public interface ProduitRepository extends SoftDeleteRepository<Produit, Long> {
    @Override
    @NonNull
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Produit> findAll(Pageable pageable);

    @Query("SELECT p FROM Produit p WHERE p.deleted = false")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Produit> findAllActive(Pageable pageable);

    @Query("SELECT p FROM Produit p WHERE p.deleted = true")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<Produit> findAllDeleted(Pageable pageable);

    @Query("SELECT p FROM Produit p WHERE p.deleted = false")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findAllProjectedBy(Pageable pageable, Class<T> type);

    @Query("SELECT p FROM Produit p WHERE p.deleted = true")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByDeletedTrue(Pageable pageable, Class<T> type);

    default <T> Page<T> findAll(Pageable pageable, Class<T> type) {
        return findAllProjectedBy(pageable, type);
    }

    @Query("SELECT p FROM Produit p WHERE p.deleted = false AND LOWER(p.libelle) LIKE LOWER(CONCAT('%', :libelle, '%'))")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByLibelleContainingIgnoreCase(@Param("libelle") String libelle, Pageable pageable, Class<T> type);

    @Query("SELECT p FROM Produit p WHERE p.deleted = false AND LOWER(p.libelle) LIKE LOWER(CONCAT(:libelle, '%'))")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByLibelleStartingWithIgnoreCase(@Param("libelle") String libelle, Pageable pageable, Class<T> type);

    @Query("SELECT p FROM Produit p WHERE p.deleted = false AND p.categorie.id = :categorieId")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    <T> Page<T> findByCategorie_Id(@Param("categorieId") Long categorieId, Pageable pageable, Class<T> type);

    @Query("SELECT p FROM Produit p WHERE p.stockDisponible < p.seuilRuptureStock")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<ProduitStockProjection> findProduitsEnRupture(Pageable pageable);

    @Query("SELECT new sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO(p.id, p.libelle, p.prixAchat) " +
            "FROM Produit p " +
            "WHERE p.deleted = false AND LOWER(p.libelle) LIKE LOWER(CONCAT(:prefix, '%'))")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<AddApproProductLibelleSearchResponseDTO> findApprovisionnementSuggestions(@Param("prefix") String prefix, Pageable pageable);

    @Query("""
           SELECT p.id as id,
                  p.image as image,
                  p.libelle as libelle,
                  p.prixVente as prixVente,
                  p.prixAchat as prixAchat,
                  p.stockDisponible as stockDisponible,
                  c as categorie,
                  COALESCE(SUM(dv.quantiteVendu), 0) as totalQuantiteVendu,
                  COUNT(dv) as frequency
           FROM Produit p
                LEFT JOIN p.categorie c
                LEFT JOIN DetailVente dv ON dv.produit = p
           WHERE p.deleted = false
             AND p.stockDisponible <> 0
           GROUP BY p, c, p.createdAt
           ORDER BY COUNT(dv) DESC, COALESCE(SUM(dv.quantiteVendu), 0) DESC, p.createdAt ASC
           """)
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Page<ProductVenteProjection> findAllProductsBySales(Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Produit p SET p.deleted = false, p.deletedAt = null, p.deletedBy = null WHERE p.id = :id")
    void restore(@Param("id") Long id);

    @Query("SELECT p FROM Produit p WHERE p.codeProduit = :codeProduit AND p.deleted = false AND p.stockDisponible > 0")
    @QueryHints({@QueryHint(name = "org.hibernate.readOnly", value = "true")})
    Optional<Produit> findByCodeProduit(@Param("codeProduit") String codeProduit);

    @Query("SELECT COUNT(p) > 0 FROM Produit p WHERE p.deleted = false AND LOWER(p.libelle) = LOWER(:libelle)")
    boolean existsByLibelleAndDeletedFalse(@Param("libelle") String libelle);

    @Query("SELECT COUNT(p) > 0 FROM Produit p WHERE p.deleted = false AND LOWER(p.libelle) = LOWER(:libelle) AND p.id != :id")
    boolean existsByLibelleAndDeletedFalseAndIdNot(@Param("libelle") String libelle, @Param("id") Long id);
}