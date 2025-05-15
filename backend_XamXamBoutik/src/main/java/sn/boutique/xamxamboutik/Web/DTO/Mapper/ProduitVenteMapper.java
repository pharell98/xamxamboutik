package sn.boutique.xamxamboutik.Web.DTO.Mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Repository.Projection.ProductVenteProjection;
import sn.boutique.xamxamboutik.Web.DTO.Response.mobile.ProduitVenteResponseMobileDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ProduitVenteResponseWebDTO;
import java.util.List;
@Mapper(componentModel = "spring")
public interface ProduitVenteMapper {
    @Mapping(source = "categorie.libelle", target = "categorieLibelle")
    ProduitVenteResponseWebDTO toWebDTO(ProductVenteProjection projection);
    ProduitVenteResponseMobileDTO toMobileDTO(ProductVenteProjection projection);
    List<ProduitVenteResponseWebDTO> toWebDTOList (List<ProductVenteProjection> projectionList);
    List<ProduitVenteResponseMobileDTO> toMobileDTOList(List<ProductVenteProjection> projectionList);
}
