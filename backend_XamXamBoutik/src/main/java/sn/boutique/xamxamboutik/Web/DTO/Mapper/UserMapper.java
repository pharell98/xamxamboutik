package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Repository.Projection.UserProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.UserRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.UserResponseDTO;


import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Utilisateur toEntity(UserRequestDTO dto);

    @Mapping(source = "role", target = "role")
    UserResponseDTO toResponseDTO(Utilisateur utilisateur);

    List<UserResponseDTO> toResponseDTOs(List<Utilisateur> utilisateurs);

    @Mapping(source = "role", target = "role")
    UserResponseDTO toResponseDTOFromProjection(UserProjection projection);

    List<UserResponseDTO> toResponseDTOsFromProjection(List<UserProjection> projections);
}