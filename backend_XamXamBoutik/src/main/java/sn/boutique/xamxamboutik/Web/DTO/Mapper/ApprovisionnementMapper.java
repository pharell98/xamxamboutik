package sn.boutique.xamxamboutik.Web.DTO.Mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProjection;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProductProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ApprovisionnementResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ApprovisionnementProductDTO;
import java.util.List;
@Mapper(componentModel = "spring")
public interface ApprovisionnementMapper {
    @Mapping(source = "montantTotal", target = "montantAppro")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "detailAppros", ignore = true)
    Approvisionnement toEntity(ApprovisionnementRequestDTO dto);
    ApprovisionnementResponseDTO toResponseDTO(Approvisionnement approvisionnement);
    List<ApprovisionnementResponseDTO> toResponseDTOsFromProjection(List<? extends ApprovisionnementProjection> projections);
    ApprovisionnementProductDTO toProductDTO(ApprovisionnementProductProjection projection);
    List<ApprovisionnementProductDTO> toProductDTOsFromProjection(List<? extends ApprovisionnementProductProjection> projections);
}
