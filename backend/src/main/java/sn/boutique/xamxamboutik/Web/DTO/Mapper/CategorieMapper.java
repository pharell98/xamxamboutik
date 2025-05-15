package sn.boutique.xamxamboutik.Web.DTO.Mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Entity.produit.Categorie;
import sn.boutique.xamxamboutik.Web.DTO.Request.CategorieRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.CategorieResponseDTO;
import sn.boutique.xamxamboutik.Repository.Projection.CategorieProjection;
import java.util.List;
@Mapper(componentModel = "spring")
public interface CategorieMapper {
    Categorie toEntity(CategorieRequestDTO dto);
    @Mapping(target = "deleted", expression = "java(categorie.isDeleted())")
    CategorieResponseDTO toResponseDTO(Categorie categorie);
    List<CategorieResponseDTO> toResponseDTOs(List<Categorie> categories);
    List<CategorieResponseDTO> toResponseDTOsFromProjection(List<CategorieProjection> projections);
}
