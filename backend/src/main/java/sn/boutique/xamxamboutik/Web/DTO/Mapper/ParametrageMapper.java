package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Entity.parametrage.Parametrage;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ParametrageRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ParametrageResponseWebDTO;

@Mapper(componentModel = "spring")
public interface ParametrageMapper {

    @Mapping(
            target = "logo",
            expression = "java(dto.getImageURL() != null ? dto.getImageURL() : null)"
    )
    Parametrage toEntity(ParametrageRequestDTO dto);

    ParametrageResponseWebDTO toResponseWebDTO(Parametrage parametrage);

    @Mapping(source = "deleted", target = "deleted")
    ParametrageResponseWebDTO toResponseWebDTOFromProjection(ParametrageProjection projection);
}