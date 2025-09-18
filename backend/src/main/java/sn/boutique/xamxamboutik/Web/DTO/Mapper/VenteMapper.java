package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Repository.Projection.VenteProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.VenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.VenteJourResponseDTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(componentModel = "spring")
public interface VenteMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "detailVentes", ignore = true)
    @Mapping(target = "paiement", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "utilisateur", ignore = true)
    @Mapping(target = "estCredit", ignore = true)
    @Mapping(target = "montantRestant", ignore = true)
    Vente toEntity(VenteRequestDTO dto);

    @Mappings({
            @Mapping(source = "detailVenteId", target = "detailVenteId"), // Ajouté pour mapper detailVenteId
            @Mapping(source = "productId", target = "productId"),
            @Mapping(source = "libelleProduit", target = "libelleProduit"),
            @Mapping(source = "imageProduit", target = "imageProduit"),
            @Mapping(source = "categorieProduit", target = "categorieProduit"),
            @Mapping(source = "prixVendu", target = "prixVendu"),
            @Mapping(source = "quantiteVendu", target = "quantiteVendu"),
            @Mapping(source = "modePaiement", target = "modePaiement"),
            @Mapping(source = "montantTotal", target = "montantTotal"),
            @Mapping(target = "dateVente", expression = "java( formatLocalDateTime(projection.getDateVente()) )"),
            @Mapping(source = "status", target = "status"),
            @Mapping(source = "utilisateurId", target = "utilisateurId"),
            @Mapping(source = "utilisateurNom", target = "utilisateurNom")
    })
    VenteJourResponseDTO toVenteJourDTO(VenteProjection projection);

    List<VenteJourResponseDTO> toVenteJourDTOList(List<VenteProjection> projections);

    default String formatLocalDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return dateTime.format(formatter);
    }
}