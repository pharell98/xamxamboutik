package sn.boutique.xamxamboutik.Service.vente;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.DetailFactureProjection;
import sn.boutique.xamxamboutik.Repository.Projection.FactureProjection;
import sn.boutique.xamxamboutik.Repository.vente.FactureRepository;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.FactureMapperImpl;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.DetailFactureDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FactureService implements IFactureService {

    private final FactureRepository factureRepository;
    private final FactureMapperImpl factureMapper;

    @Autowired
    public FactureService(
            FactureRepository factureRepository,
            FactureMapperImpl factureMapper
    ) {
        this.factureRepository = factureRepository;
        this.factureMapper = factureMapper;
    }


    @Override
    public FactureResponseDTO getFactureByNumero(String numeroFacture) {
        FactureProjection factureData = factureRepository.findFactureByNumero(numeroFacture)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Facture introuvable (Numéro: " + numeroFacture + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));

        // Récupérer les détails des produits (nouvelle logique intelligente)
        List<DetailFactureProjection> details = factureRepository.findDetailVentesByVenteId(factureData.getVenteId());

        return factureMapper.toFactureResponseDTO(factureData, details, "smart_display");
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
    public FactureListResponseDTO getFacturesDuJour(Pageable pageable) {
        // Récupérer la date du jour
        LocalDate aujourdhui = LocalDate.now();
        LocalDateTime debutJour = aujourdhui.atStartOfDay();
        LocalDateTime finJour = aujourdhui.plusDays(1).atStartOfDay();

        // Rechercher les factures du jour
        Page<FactureProjection> facturesPage = factureRepository.findFacturesByDateRange(debutJour, finJour, pageable);

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
    public FactureListResponseDTO getFacturesParDate(LocalDate date, Pageable pageable) {
        // Convertir la date en plage de temps (de 00:00:00 à 23:59:59)
        LocalDateTime debutJour = date.atStartOfDay();
        LocalDateTime finJour = date.plusDays(1).atStartOfDay();

        // Rechercher les factures de la date donnée
        Page<FactureProjection> facturesPage = factureRepository.findFacturesByDateRange(debutJour, finJour, pageable);

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
    public FactureListResponseDTO getFacturesDuMois(Pageable pageable) {
        // Récupérer le mois en cours
        LocalDate maintenant = LocalDate.now();
        LocalDate debutMois = maintenant.withDayOfMonth(1);
        LocalDate finMois = debutMois.plusMonths(1);
        LocalDateTime debutMoisDateTime = debutMois.atStartOfDay();
        LocalDateTime finMoisDateTime = finMois.atStartOfDay();

        // Rechercher les factures du mois en cours
        Page<FactureProjection> facturesPage = factureRepository.findFacturesByDateRange(debutMoisDateTime, finMoisDateTime, pageable);

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
    public FactureResponseDTO getFactureByNumeroExcludingDefective(String numeroFacture) {
        FactureProjection factureData = factureRepository.findFactureByNumero(numeroFacture)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Facture introuvable (Numéro: " + numeroFacture + ")",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));

        // Récupérer les détails en excluant les produits défectueux
        List<DetailFactureProjection> details = factureRepository.findDetailVentesForFactureExcludingDefective(factureData.getVenteId());

        return factureMapper.toFactureResponseDTO(factureData, details, "excluding_defective");
    }

}
