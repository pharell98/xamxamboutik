package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.springframework.data.domain.Page;
import sn.boutique.xamxamboutik.Repository.Projection.DetailFactureProjection;
import sn.boutique.xamxamboutik.Repository.Projection.FactureProjection;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.MiniRecuResponseDTO;

import java.util.List;

public interface FactureMapper {
    
    /**
     * Convertit une projection en DTO de facture complète
     */
    FactureResponseDTO toFactureResponseDTO(FactureProjection projection, List<DetailFactureProjection> details, String typeFacture);
    
    /**
     * Convertit une projection en DTO de mini reçu
     */
    MiniRecuResponseDTO toMiniRecuResponseDTO(FactureProjection projection, List<DetailFactureProjection> details);
    
    /**
     * Convertit une page de projections en DTO de liste de factures
     */
    FactureListResponseDTO toFactureListResponseDTO(Page<FactureProjection> projectionsPage);
    
    /**
     * Convertit une page de projections en DTO de liste de factures avec détails des produits
     */
    FactureListResponseDTO toFactureListResponseDTOWithDetails(Page<FactureProjection> projectionsPage);
}
