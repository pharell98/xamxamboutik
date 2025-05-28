package sn.boutique.xamxamboutik.Service.vente;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Entity.vente.DetailVente;
import sn.boutique.xamxamboutik.Entity.vente.Paiement;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Enums.ModePaiement;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.ProductVenteProjection;
import sn.boutique.xamxamboutik.Repository.Projection.VenteProjection;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Repository.vente.DetailVenteRepository;
import sn.boutique.xamxamboutik.Repository.vente.PaiementRepository;
import sn.boutique.xamxamboutik.Repository.vente.VenteRepository;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitVenteMapper;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.VenteMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.DetailVenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.VenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.VenteJourResponseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class VenteService implements IVenteService {
    private final VenteRepository venteRepository;
    private final DetailVenteRepository detailVenteRepository;
    private final PaiementRepository paiementRepository;
    private final ProduitRepository produitRepository;
    private final VenteMapper venteMapper;
    private final ProduitVenteMapper produitVenteMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public VenteService(
            VenteRepository venteRepository,
            DetailVenteRepository detailVenteRepository,
            PaiementRepository paiementRepository,
            ProduitRepository produitRepository,
            VenteMapper venteMapper,
            ProduitVenteMapper produitVenteMapper,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.venteRepository = venteRepository;
        this.detailVenteRepository = detailVenteRepository;
        this.paiementRepository = paiementRepository;
        this.produitRepository = produitRepository;
        this.venteMapper = venteMapper;
        this.produitVenteMapper = produitVenteMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Vente createVente(VenteRequestDTO dto) {
        Vente vente = venteMapper.toEntity(dto);
        vente.setDate(LocalDateTime.now());
        double totalMontant = 0.0;
        vente.setEstCredit(false);
        vente.setMontantRestant(0.0);

        List<DetailVente> detailVentes = new ArrayList<>();
        if (dto.getDetailVenteList() != null) {
            for (DetailVenteRequestDTO detailDTO : dto.getDetailVenteList()) {
                Produit produit = produitRepository.findById(detailDTO.getProduitId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Produit introuvable (ID: " + detailDTO.getProduitId() + ")",
                                ErrorCodes.ENTITY_NOT_FOUND));
                int stockRestant = produit.getStockDisponible() - detailDTO.getQuantiteVendu();
                if (stockRestant < 0) {
                    throw new BaseCustomException(
                            "Stock insuffisant pour : " + produit.getLibelle(),
                            ErrorCodes.INSUFFICIENT_STOCK
                    );
                }
                produit.setStockDisponible(stockRestant);
                DetailVente detailVente = new DetailVente();
                detailVente.setVente(vente);
                detailVente.setProduit(produit);
                detailVente.setPrixVente(detailDTO.getPrixVente());
                detailVente.setQuantiteVendu(detailDTO.getQuantiteVendu());
                detailVente.setMontantTotal(detailDTO.getPrixVente() * detailDTO.getQuantiteVendu());
                detailVente.setStatus(StatusDetailVente.VENDU);
                detailVentes.add(detailVente);
                totalMontant += detailVente.getMontantTotal();
            }
        }

        vente.setMontantTotal(totalMontant);
        vente.setDetailVentes(new HashSet<>(detailVentes));

        Paiement paiement = new Paiement();
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setMontantVerser(totalMontant);
        paiement.setModePaiement(dto.getModePaiement() != null ? dto.getModePaiement() : ModePaiement.ESPECE);
        paiement.setVente(vente);
        vente.setPaiement(paiement);

        Vente savedVente = venteRepository.save(vente);
        notifyUpdate(savedVente);
        return savedVente;
    }

    private void notifyUpdate(Vente vente) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "SALE");
        message.put("saleId", vente.getId());
        List<Map<String, Object>> soldItems = new ArrayList<>();
        for (DetailVente detail : vente.getDetailVentes()) {
            Map<String, Object> item = new HashMap<>();
            item.put("productId", detail.getProduit().getId());
            item.put("quantity", detail.getQuantiteVendu());
            item.put("libelle", detail.getProduit().getLibelle());
            soldItems.add(item);
        }
        message.put("soldItems", soldItems);
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/ventes", message);
            System.out.println("Message STOMP envoyé à /topic/ventes pour vente ID: " + vente.getId());
        } else {
            System.out.println("SimpMessagingTemplate non disponible, message STOMP non envoyé pour vente ID: " + vente.getId());
        }
    }

    @Override
    public Page<?> getAllProductsBySalesPage(String clientType, Pageable pageable) {
        Page<ProductVenteProjection> projectionPage = produitRepository.findAllProductsBySales(pageable);
        if ("mobile".equalsIgnoreCase(clientType)) {
            List<?> content = produitVenteMapper.toMobileDTOList(projectionPage.getContent());
            return new PageImpl<>(content, pageable, projectionPage.getTotalElements());
        } else {
            List<?> content = produitVenteMapper.toWebDTOList(projectionPage.getContent());
            return new PageImpl<>(content, pageable, projectionPage.getTotalElements());
        }
    }

    @Override
    public Page<VenteJourResponseDTO> getTodaySales(Pageable pageable, Double minAmount, Double maxAmount) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Page<VenteProjection> projections = venteRepository.findTodaySales(startOfDay, endOfDay, minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getTodaySalesTotalAmount(Double minAmount, Double maxAmount) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return venteRepository.sumTodaySales(startOfDay, endOfDay, minAmount, maxAmount);
    }

    @Override
    public Page<VenteJourResponseDTO> getLast7DaysSales(Pageable pageable, Double minAmount, Double maxAmount) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(sevenDaysAgo, now, minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getLast7DaysSalesTotalAmount(Double minAmount, Double maxAmount) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        return venteRepository.sumSalesBetween(sevenDaysAgo, now, minAmount, maxAmount);
    }

    @Override
    public Page<VenteJourResponseDTO> getMonthSales(Pageable pageable, Double minAmount, Double maxAmount) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfMonth, startOfNextMonth, minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getMonthSalesTotalAmount(Double minAmount, Double maxAmount) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        return venteRepository.sumSalesBetween(startOfMonth, startOfNextMonth, minAmount, maxAmount);
    }

    @Override
    public Page<VenteJourResponseDTO> getYearSales(Pageable pageable, Double minAmount, Double maxAmount) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime startOfNextYear = startOfYear.plusYears(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfYear, startOfNextYear, minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getYearSalesTotalAmount(Double minAmount, Double maxAmount) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime startOfNextYear = startOfYear.plusYears(1);
        return venteRepository.sumSalesBetween(startOfYear, startOfNextYear, minAmount, maxAmount);
    }

    @Override
    public Page<VenteJourResponseDTO> getSalesByExactDate(LocalDate date, Pageable pageable, Double minAmount, Double maxAmount) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfDay, endOfDay, minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getSalesByExactDateTotalAmount(LocalDate date, Double minAmount, Double maxAmount) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return venteRepository.sumSalesBetween(startOfDay, endOfDay, minAmount, maxAmount);
    }

    @Override
    public Page<VenteJourResponseDTO> getAllSales(Pageable pageable, Double minAmount, Double maxAmount) {
        Page<VenteProjection> projections = venteRepository.findAllSales(minAmount, maxAmount, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getAllSalesTotalAmount(Double minAmount, Double maxAmount) {
        return venteRepository.sumAllSales(minAmount, maxAmount);
    }

    private Page<VenteJourResponseDTO> buildVenteJourPageResponse(Page<VenteProjection> projections) {
        List<VenteJourResponseDTO> dtos = venteMapper.toVenteJourDTOList(projections.getContent());
        return new PageImpl<>(dtos, projections.getPageable(), projections.getTotalElements());
    }

    public double getTotalAmount(Page<VenteJourResponseDTO> page) {
        return page.getContent().stream()
                .mapToDouble(VenteJourResponseDTO::getMontantTotal)
                .sum();
    }
}