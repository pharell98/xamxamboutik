package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Entity.parametre.Parametrage;
import sn.boutique.xamxamboutik.Repository.Projection.ParametrageProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ParametrageRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ParametrageResponseWebDTO;

@Component
public class ParametrageMapperImpl implements ParametrageMapper {

    @Override
    public Parametrage toEntity(ParametrageRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Parametrage parametrage = new Parametrage();
        parametrage.setShopName(dto.getShopName());
        parametrage.setEmail(dto.getEmail());
        parametrage.setPhone(dto.getPhone());
        parametrage.setCountry(dto.getCountry());
        parametrage.setRegion(dto.getRegion());
        parametrage.setDepartment(dto.getDepartment());
        parametrage.setNeighborhood(dto.getNeighborhood());
        parametrage.setStreet(dto.getStreet());
        parametrage.setFacebookUrl(dto.getFacebookUrl());
        parametrage.setInstagramUrl(dto.getInstagramUrl());
        parametrage.setTwitterUrl(dto.getTwitterUrl());
        parametrage.setWebsiteUrl(dto.getWebsiteUrl());
        parametrage.setLogo(dto.getImageURL() != null ? dto.getImageURL() : null);

        return parametrage;
    }

    @Override
    public ParametrageResponseWebDTO toResponseWebDTO(Parametrage parametrage) {
        if (parametrage == null) {
            return null;
        }

        ParametrageResponseWebDTO dto = new ParametrageResponseWebDTO();
        dto.setId(parametrage.getId());
        dto.setShopName(parametrage.getShopName());
        dto.setLogo(parametrage.getLogo());
        dto.setEmail(parametrage.getEmail());
        dto.setPhone(parametrage.getPhone());
        dto.setCountry(parametrage.getCountry());
        dto.setRegion(parametrage.getRegion());
        dto.setDepartment(parametrage.getDepartment());
        dto.setNeighborhood(parametrage.getNeighborhood());
        dto.setStreet(parametrage.getStreet());
        dto.setFacebookUrl(parametrage.getFacebookUrl());
        dto.setInstagramUrl(parametrage.getInstagramUrl());
        dto.setTwitterUrl(parametrage.getTwitterUrl());
        dto.setWebsiteUrl(parametrage.getWebsiteUrl());
        dto.setDeleted(parametrage.isDeleted());

        return dto;
    }

    @Override
    public ParametrageResponseWebDTO toResponseWebDTOFromProjection(ParametrageProjection projection) {
        if (projection == null) {
            return null;
        }

        ParametrageResponseWebDTO dto = new ParametrageResponseWebDTO();
        dto.setId(projection.getId());
        dto.setShopName(projection.getShopName());
        dto.setLogo(projection.getLogo());
        dto.setEmail(projection.getEmail());
        dto.setPhone(projection.getPhone());
        dto.setCountry(projection.getCountry());
        dto.setRegion(projection.getRegion());
        dto.setDepartment(projection.getDepartment());
        dto.setNeighborhood(projection.getNeighborhood());
        dto.setStreet(projection.getStreet());
        dto.setFacebookUrl(projection.getFacebookUrl());
        dto.setInstagramUrl(projection.getInstagramUrl());
        dto.setTwitterUrl(projection.getTwitterUrl());
        dto.setWebsiteUrl(projection.getWebsiteUrl());
        dto.setDeleted(projection.isDeleted());

        return dto;
    }
} 