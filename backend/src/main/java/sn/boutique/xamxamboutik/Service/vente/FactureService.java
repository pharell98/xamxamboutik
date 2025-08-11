package sn.boutique.xamxamboutik.Service.vente;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.vente.DetailVente;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Enums.TypeFacture;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.DetailFactureProjection;
import sn.boutique.xamxamboutik.Repository.Projection.FactureProjection;
import sn.boutique.xamxamboutik.Repository.vente.FactureRepository;
import sn.boutique.xamxamboutik.Repository.vente.VenteRepository;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.FactureMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureGenerateRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureSearchRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.MiniRecuResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.DetailFactureDTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FactureService implements IFactureService {
    
    private final FactureRepository factureRepository;
    private final VenteRepository venteRepository;
    private final FactureMapper factureMapper;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    @Autowired
    public FactureService(
            FactureRepository factureRepository,
            VenteRepository venteRepository,
            FactureMapper factureMapper
    ) {
        this.factureRepository = factureRepository;
        this.venteRepository = venteRepository;
        this.factureMapper = factureMapper;
    }
    
    @Override
    public FactureResponseDTO generateFacture(FactureGenerateRequestDTO request) {
        // Récupérer la vente
        Vente vente = venteRepository.findById(request.getVenteId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vente introuvable (ID: " + request.getVenteId() + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Vérifier que la vente a un numéro de facture
        if (vente.getNumeroFacture() == null) {
            throw new IllegalStateException("La vente n'a pas de numéro de facture");
        }
        
        // Récupérer les données de la facture
        FactureProjection factureData = factureRepository.findFactureByVenteId(request.getVenteId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Données de facture introuvables pour la vente (ID: " + request.getVenteId() + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(request.getVenteId());
        
        // Générer la facture complète
        return factureMapper.toFactureResponseDTO(factureData, details, "complete");
    }
    
    @Override
    public MiniRecuResponseDTO generateMiniRecu(FactureGenerateRequestDTO request) {
        // Récupérer la vente
        Vente vente = venteRepository.findById(request.getVenteId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vente introuvable (ID: " + request.getVenteId() + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Vérifier que la vente a un numéro de facture
        if (vente.getNumeroFacture() == null) {
            throw new IllegalStateException("La vente n'a pas de numéro de facture");
        }
        
        // Récupérer les données de la facture
        FactureProjection factureData = factureRepository.findFactureByVenteId(request.getVenteId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Données de facture introuvables pour la vente (ID: " + request.getVenteId() + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(request.getVenteId());
        
        // Générer le mini reçu
        return factureMapper.toMiniRecuResponseDTO(factureData, details);
    }
    
    @Override
    public FactureResponseDTO getFactureByNumero(String numeroFacture) {
        FactureProjection factureData = factureRepository.findFactureByNumero(numeroFacture)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Facture introuvable (Numéro: " + numeroFacture + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(factureData.getVenteId());
        
        return factureMapper.toFactureResponseDTO(factureData, details, "complete");
    }
    
    @Override
    public FactureResponseDTO getFactureByVenteId(Long venteId) {
        FactureProjection factureData = factureRepository.findFactureByVenteId(venteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Facture introuvable (Vente ID: " + venteId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(venteId);
        
        return factureMapper.toFactureResponseDTO(factureData, details, "complete");
    }
    
    @Override
    public FactureListResponseDTO searchFactures(FactureSearchRequestDTO request) {
        // Créer la pagination
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        // Convertir les dates
        LocalDateTime dateDebut = request.getDateDebut() != null ? 
                request.getDateDebut().atStartOfDay() : null;
        LocalDateTime dateFin = request.getDateFin() != null ? 
                request.getDateFin().plusDays(1).atStartOfDay() : null;
        
        // Rechercher les factures
        Page<FactureProjection> facturesPage = factureRepository.searchFactures(
                request.getNumeroFacture(),
                dateDebut,
                dateFin,
                request.getNomClient(),
                request.getTelephoneClient(),
                request.getModePaiement() != null ? request.getModePaiement().getKey() : null,
                request.getEstCredit(),
                request.getMontantMin(),
                request.getMontantMax(),
                pageable
        );
        
        // Convertir en DTO de réponse
        return factureMapper.toFactureListResponseDTO(facturesPage);
    }
    
    @Override
    public FactureListResponseDTO getAllFactures(Pageable pageable) {
        // Récupérer toutes les ventes avec pagination
        Page<FactureProjection> facturesPage = factureRepository.findAllFacturesWithDetails(pageable);
        
        // Convertir en DTO de réponse
        FactureListResponseDTO response = factureMapper.toFactureListResponseDTO(facturesPage);
        
        // Pour chaque facture, récupérer et ajouter les détails des produits
        response.getFactures().forEach(facture -> {
            // Trouver la projection correspondante pour obtenir l'ID de la vente
            FactureProjection projection = facturesPage.getContent().stream()
                .filter(p -> p.getNumeroFacture().equals(facture.getNumeroFacture()))
                .findFirst()
                .orElse(null);
            
            if (projection != null) {
                // Récupérer les détails des produits
                List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(projection.getVenteId());
                
                // Convertir les détails en DTOs
                List<DetailFactureDTO> detailDtos = details.stream()
                    .map(detail -> {
                        DetailFactureDTO detailDto = new DetailFactureDTO();
                        detailDto.setLibelle(detail.getLibelleProduit());
                        detailDto.setQuantite(detail.getQuantiteVendu());
                        detailDto.setPrix(detail.getPrixVente());
                        detailDto.setMontantTotal(detail.getMontantTotal());
                        return detailDto;
                    })
                    .collect(Collectors.toList());
                
                facture.setDetailFacture(detailDtos);
            }
        });
        
        return response;
    }
    
    @Override
    public boolean existsByNumeroFacture(String numeroFacture) {
        return factureRepository.existsByNumeroFacture(numeroFacture);
    }
    
    @Override
    public MiniRecuResponseDTO getMiniRecuByNumero(String numeroFacture) {
        FactureProjection factureData = factureRepository.findFactureByNumero(numeroFacture)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Facture introuvable (Numéro: " + numeroFacture + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
        
        // Récupérer les détails des produits
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(factureData.getVenteId());
        
        return factureMapper.toMiniRecuResponseDTO(factureData, details);
    }
}
