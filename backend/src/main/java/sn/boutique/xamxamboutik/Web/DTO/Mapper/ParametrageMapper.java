package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import sn.boutique.xamxamboutik.Entity.parametre.Parametrage;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ParametrageRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ParametrageResponseWebDTO;

public interface ParametrageMapper {

    Parametrage toEntity(ParametrageRequestDTO dto);

    ParametrageResponseWebDTO toResponseWebDTO(Parametrage parametrage);

    ParametrageResponseWebDTO toResponseWebDTOFromProjection(ParametrageProjection projection);
} 