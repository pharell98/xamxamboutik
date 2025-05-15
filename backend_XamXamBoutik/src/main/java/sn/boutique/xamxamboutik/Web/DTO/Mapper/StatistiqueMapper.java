package sn.boutique.xamxamboutik.Web.DTO.Mapper;
import org.mapstruct.Mapper;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.StatistiqueResponseWebDTO;
@Mapper(componentModel = "spring")
public interface StatistiqueMapper {
    StatistiqueResponseWebDTO toDTO(Double benefit);
}
