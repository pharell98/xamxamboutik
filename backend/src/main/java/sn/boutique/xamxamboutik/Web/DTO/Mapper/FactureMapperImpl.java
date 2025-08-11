package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Repository.Projection.DetailFactureProjection;
import sn.boutique.xamxamboutik.Repository.Projection.FactureProjection;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FactureMapperImpl implements FactureMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
    
    @Override
    public FactureResponseDTO toFactureResponseDTO(FactureProjection projection, List<DetailFactureProjection> details, String typeFacture) {
        if (projection == null) {
            return null;
        }
        
        FactureResponseDTO dto = new FactureResponseDTO();
        dto.setNumeroFacture(projection.getNumeroFacture());
        // Une seule date formatée
        dto.setDateVenteFormatted(projection.getDateVente().format(DATE_FORMATTER));
        dto.setMontantTotal(projection.getMontantTotal());
        dto.setMontantRestant(projection.getMontantRestant());
        dto.setEstCredit(projection.getEstCredit());
        // Date de génération formatée
        dto.setDateGeneration(java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER));
        
        // Client
        if (projection.getNomClient() != null || projection.getTelephoneClient() != null) {
            ClientFactureDTO clientDto = new ClientFactureDTO();
            clientDto.setNom(projection.getNomClient());
            clientDto.setTelephone(projection.getTelephoneClient());
            dto.setClient(clientDto);
        }
        
        // Paiement
        if (projection.getModePaiement() != null) {
            PaiementFactureDTO paiementDto = new PaiementFactureDTO();
            paiementDto.setModePaiement(projection.getModePaiement());
            paiementDto.setMontantVerser(projection.getMontantVerser());
            paiementDto.setDatePaiement(projection.getDatePaiement());
            dto.setPaiement(paiementDto);
            
            // Calculer le montant payé
            dto.setMontantPayer(projection.getMontantVerser());
        }
        
        // Détails des produits
        if (details != null && !details.isEmpty()) {
            List<DetailFactureDTO> detailDtos = details.stream()
                    .map(this::toDetailFactureDTO)
                    .collect(Collectors.toList());
            dto.setDetailFacture(detailDtos);
        }
        
        return dto;
    }
    
    @Override
    public MiniRecuResponseDTO toMiniRecuResponseDTO(FactureProjection projection, List<DetailFactureProjection> details) {
        if (projection == null) {
            return null;
        }
        
        MiniRecuResponseDTO dto = new MiniRecuResponseDTO();
        dto.setNumeroFacture(projection.getNumeroFacture());
        dto.setDateVente(projection.getDateVente().format(DATE_FORMATTER));
        dto.setNomClient(projection.getNomClient());
        dto.setTelephoneClient(projection.getTelephoneClient());
        dto.setModePaiement(projection.getModePaiement());
        dto.setMontantTotal(projection.getMontantTotal());
        dto.setMontantPayer(projection.getMontantVerser());
        dto.setMontantRestant(projection.getMontantRestant());
        // Date de génération formatée
        dto.setDateGeneration(java.time.LocalDateTime.now().format(DATE_TIME_FORMATTER));
        dto.setMessageFooter("Merci de votre confiance !");
        
        // Détails des produits
        if (details != null && !details.isEmpty()) {
            List<DetailMiniRecuDTO> detailDtos = details.stream()
                    .map(this::toDetailMiniRecuDTO)
                    .collect(Collectors.toList());
            dto.setDetailFacture(detailDtos);
        }
        
        return dto;
    }
    
    @Override
    public FactureListResponseDTO toFactureListResponseDTO(Page<FactureProjection> projectionsPage) {
        if (projectionsPage == null) {
            return null;
        }
        
        FactureListResponseDTO dto = new FactureListResponseDTO();
        dto.setTotalElements(projectionsPage.getTotalElements());
        dto.setTotalPages(projectionsPage.getTotalPages());
        dto.setCurrentPage(projectionsPage.getNumber());
        dto.setPageSize(projectionsPage.getSize());
        
        // Convertir les factures
        List<FactureSummaryDTO> factures = projectionsPage.getContent().stream()
                .map(this::toFactureSummaryDTO)
                .collect(Collectors.toList());
        dto.setFactures(factures);
        
        return dto;
    }
    
    @Override
    public FactureListResponseDTO toFactureListResponseDTOWithDetails(Page<FactureProjection> projectionsPage) {
        if (projectionsPage == null) {
            return null;
        }
        
        FactureListResponseDTO dto = new FactureListResponseDTO();
        dto.setTotalElements(projectionsPage.getTotalElements());
        dto.setTotalPages(projectionsPage.getTotalPages());
        dto.setCurrentPage(projectionsPage.getNumber());
        dto.setPageSize(projectionsPage.getSize());
        
        // Convertir les factures avec détails
        List<FactureSummaryDTO> factures = projectionsPage.getContent().stream()
                .map(this::toFactureSummaryDTOWithDetails)
                .collect(Collectors.toList());
        dto.setFactures(factures);
        
        return dto;
    }
    
    private DetailFactureDTO toDetailFactureDTO(DetailFactureProjection detail) {
        DetailFactureDTO dto = new DetailFactureDTO();
        dto.setLibelle(detail.getLibelleProduit());
        dto.setQuantite(detail.getQuantiteVendu());
        dto.setPrix(detail.getPrixVente());
        dto.setMontantTotal(detail.getMontantTotal());
        return dto;
    }
    
    private DetailMiniRecuDTO toDetailMiniRecuDTO(DetailFactureProjection detail) {
        DetailMiniRecuDTO dto = new DetailMiniRecuDTO();
        dto.setLibelle(detail.getLibelleProduit());
        dto.setQuantite(detail.getQuantiteVendu());
        dto.setPrix(detail.getPrixVente());
        dto.setMontantTotal(detail.getMontantTotal());
        return dto;
    }
    
    private FactureSummaryDTO toFactureSummaryDTO(FactureProjection projection) {
        FactureSummaryDTO dto = new FactureSummaryDTO();
        dto.setNumeroFacture(projection.getNumeroFacture());
        dto.setDateVente(projection.getDateVente());
        dto.setNomClient(projection.getNomClient());
        dto.setTelephoneClient(projection.getTelephoneClient());
        dto.setModePaiement(projection.getModePaiement());
        dto.setMontantTotal(projection.getMontantTotal());
        dto.setMontantPayer(projection.getMontantVerser());
        dto.setMontantRestant(projection.getMontantRestant());
        dto.setEstCredit(projection.getEstCredit());
        return dto;
    }
    
    private FactureSummaryDTO toFactureSummaryDTOWithDetails(FactureProjection projection) {
        FactureSummaryDTO dto = new FactureSummaryDTO();
        dto.setNumeroFacture(projection.getNumeroFacture());
        dto.setDateVente(projection.getDateVente());
        dto.setNomClient(projection.getNomClient());
        dto.setTelephoneClient(projection.getTelephoneClient());
        dto.setModePaiement(projection.getModePaiement());
        dto.setMontantTotal(projection.getMontantTotal());
        dto.setMontantPayer(projection.getMontantVerser());
        dto.setMontantRestant(projection.getMontantRestant());
        dto.setEstCredit(projection.getEstCredit());
        
        // Récupérer les détails des produits pour cette vente
        // Note: Cette méthode nécessite l'injection du FactureRepository
        // Pour l'instant, on laisse le champ detailFacture à null
        // Il sera rempli par le service
        return dto;
    }
}
