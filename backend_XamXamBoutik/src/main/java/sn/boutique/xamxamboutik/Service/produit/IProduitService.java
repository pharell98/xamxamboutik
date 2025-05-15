package sn.boutique.xamxamboutik.Service.produit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;

import java.util.Optional;

public interface IProduitService {
    Page<ProduitProjection> findAllProjection(Pageable pageable);
    Page<ProduitProjection> findDeletedProjection(Pageable pageable);
    Page<ProduitProjection> findByCategoryId(Long categoryId, Pageable pageable);
    Produit save(ProduitRequestDTO dto, MultipartFile file) throws Exception;
    Produit saveWithoutAppro(ProduitRequestDTO dto, MultipartFile file) throws Exception;
    Produit update(ProduitRequestDTO dto, MultipartFile file) throws Exception;
    Produit update(Produit produit);
    Optional<Produit> findByCode(String codeProduit);
    Produit restore(Long id);
    Page<ProduitProjection> suggestionsByLibelleProjection(String prefix, Pageable pageable);
    Page<AddApproProductLibelleSearchResponseDTO> suggestionsForApprovisionnement(String prefix, Pageable pageable);
}