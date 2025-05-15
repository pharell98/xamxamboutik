package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitResponseWebDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.mobile.ProduitResponseMobileDTO;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitProjection;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitStockProjection;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitStockResponseDTO;
import sn.boutique.xamxamboutik.Repository.Projection.PreApproProductLibelleSearch;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProduitMapper {
    @Mapping(source = "categorieId", target = "categorie.id")
    @Mapping(
            target = "image",
            expression = "java(dto.getImageURL() != null ? dto.getImageURL() : dto.getImage())"
    )
    Produit toEntity(ProduitRequestDTO dto);

    @Mapping(source = "categorie.libelle", target = "categorie")
    @Mapping(source = "coupMoyenAcquisition", target = "coupMoyenAcquisition")
    ProduitResponseWebDTO toResponseWebDTO(Produit produit);

    @Mapping(source = "categorie.libelle", target = "categorie")
    @Mapping(source = "coupMoyenAcquisition", target = "coupMoyenAcquisition")
    ProduitResponseMobileDTO toResponseMobileDTO(Produit produit);

    List<ProduitResponseWebDTO> toResponseWebDTOs(List<Produit> produits);
    List<ProduitResponseMobileDTO> toResponseMobileDTOs(List<Produit> produits);

    @Mapping(source = "categorie.libelle", target = "categorie")
    @Mapping(source = "coupMoyenAcquisition", target = "coupMoyenAcquisition")
    @Mapping(source = "deleted", target = "deleted") // Mappage explicite pour la projection
    ProduitResponseWebDTO toResponseWebDTOFromProjection(ProduitProjection projection);

    List<ProduitResponseWebDTO> toResponseWebDTOsFromProjection(List<ProduitProjection> projections);

    @Mapping(source = "stockDisponible", target = "stockDisponible")
    ProduitStockResponseDTO toProduitStockResponseDTO(ProduitStockProjection projection);

    List<ProduitStockResponseDTO> toProduitStockResponseDTOs(List<ProduitStockProjection> projections);

    AddApproProductLibelleSearchResponseDTO toApproSearchResponse(PreApproProductLibelleSearch projection);

    List<AddApproProductLibelleSearchResponseDTO> toApproSearchResponseList(List<PreApproProductLibelleSearch> projections);
}