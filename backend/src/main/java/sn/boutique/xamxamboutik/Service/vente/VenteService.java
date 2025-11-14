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
import sn.boutique.xamxamboutik.Service.user.CurrentUserService;
import sn.boutique.xamxamboutik.Service.statistique.CaisseInternalService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitVenteMapper;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.VenteMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.DetailVenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.VenteRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.VenteJourResponseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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
    private final CurrentUserService currentUserService;
    private final CaisseInternalService caisseInternalService;

    @Autowired
    public VenteService(
            VenteRepository venteRepository,
            DetailVenteRepository detailVenteRepository,
            PaiementRepository paiementRepository,
            ProduitRepository produitRepository,
            VenteMapper venteMapper,
            ProduitVenteMapper produitVenteMapper,
            SimpMessagingTemplate messagingTemplate,
            CurrentUserService currentUserService,
            CaisseInternalService caisseInternalService
    ) {
        this.venteRepository = venteRepository;
        this.detailVenteRepository = detailVenteRepository;
        this.paiementRepository = paiementRepository;
        this.produitRepository = produitRepository;
        this.venteMapper = venteMapper;
        this.produitVenteMapper = produitVenteMapper;
        this.messagingTemplate = messagingTemplate;
        this.currentUserService = currentUserService;
        this.caisseInternalService = caisseInternalService;
    }

    @Override
    public Vente createVente(VenteRequestDTO dto) {
        // IMPORTANT: Ouverture automatique de la caisse avant toute vente
        caisseInternalService.ouvrirCaisseAutomatiquement();
        
        // Tentative de création avec retry en cas de conflit de numéro de facture
        int maxRetries = 3;
        int attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                return createVenteInternal(dto);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new BaseCustomException(
                            "Impossible de créer la vente après " + maxRetries + " tentatives. Conflit de numéro de facture.",
                            ErrorCodes.INTERNAL_ERROR
                    );
                }
                // Attendre un peu avant de réessayer
                try {
                    Thread.sleep(100 * attempt); // 100ms, 200ms, 300ms
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new BaseCustomException("Interruption lors de la création de la vente", ErrorCodes.INTERNAL_ERROR);
                }
            }
        }
        
        throw new BaseCustomException("Erreur lors de la création de la vente", ErrorCodes.INTERNAL_ERROR);
    }
    
    /**
     * Méthode interne pour créer une vente avec gestion des erreurs
     */
    private Vente createVenteInternal(VenteRequestDTO dto) {
        Vente vente = venteMapper.toEntity(dto);
        vente.setDate(LocalDateTime.now());

        // Assigner automatiquement l'utilisateur connecté
        vente.setUtilisateur(currentUserService.getCurrentUser());

        // Génération automatique du numéro de facture avec protection anti-doublon
        vente.setNumeroFacture(generateNumeroFacture());

        // Initialisation des valeurs par défaut
        vente.setEstCredit(false);
        vente.setMontantRestant(0.0);

        // Traitement des détails de vente
        List<DetailVente> detailVentes = new ArrayList<>();
        double totalMontant = 0.0;
        
        if (dto.getDetailVenteList() != null && !dto.getDetailVenteList().isEmpty()) {
            for (DetailVenteRequestDTO detailDTO : dto.getDetailVenteList()) {
                // Récupération et validation du produit
                Produit produit = produitRepository.findById(detailDTO.getProduitId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Produit introuvable (ID: " + detailDTO.getProduitId() + ")",
                                ErrorCodes.ENTITY_NOT_FOUND));
                
                // Vérification du stock disponible
                if (produit.getStockDisponible() < detailDTO.getQuantiteVendu()) {
                    throw new BaseCustomException(
                            "Stock insuffisant pour : " + produit.getLibelle() + 
                            " (Disponible: " + produit.getStockDisponible() + ", Demandé: " + detailDTO.getQuantiteVendu() + ")",
                            ErrorCodes.INSUFFICIENT_STOCK
                    );
                }
                
                // Mise à jour du stock
                produit.setStockDisponible(produit.getStockDisponible() - detailDTO.getQuantiteVendu());
                
                // Création du détail de vente
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
        vente.getPaiements().add(paiement);

        Vente savedVente = venteRepository.save(vente);
        
        // IMPORTANT: Mise à jour en temps réel des montants de caisse après chaque vente
        // Cette opération est non-critique, donc on ne fait pas échouer la transaction si elle échoue
        try {
            caisseInternalService.updateVentesJournalieresRealtime();
        } catch (Exception e) {
            // Log l'erreur mais ne fait pas échouer la création de la vente
            System.err.println("Erreur lors de la mise à jour de la caisse (non-critique): " + e.getMessage());
        }
        
        notifyUpdate(savedVente);
        return savedVente;
    }

    /**
     * Génère automatiquement un numéro de facture au format FAC-JJ-MM-AA-0001
     * PROTECTION ANTI-DOUBLON : Utilise un verrou pessimiste (synchronized) pour éviter les race conditions
     *
     * @return Le numéro de facture généré
     */
    private synchronized String generateNumeroFacture() {
        LocalDateTime now = LocalDateTime.now();
        String jour = String.format("%02d", now.getDayOfMonth());
        String mois = String.format("%02d", now.getMonthValue());
        String annee = String.format("%02d", now.getYear() % 100); // Prend les 2 derniers chiffres de l'année

        String prefix = "FAC-" + jour + "-" + mois + "-" + annee + "-";

        // Récupérer le dernier numéro de facture du jour
        Optional<String> lastNumero = venteRepository.findLastNumeroFactureByPrefix(prefix);

        int sequence = 1;
        if (lastNumero.isPresent()) {
            String lastNum = lastNumero.get();
            // Extraire le numéro de séquence (les 4 derniers chiffres)
            String sequenceStr = lastNum.substring(lastNum.lastIndexOf("-") + 1);
            try {
                sequence = Integer.parseInt(sequenceStr) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }

        return prefix + String.format("%04d", sequence);
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

            List<?> content = produitVenteMapper.toWebDTOList(projectionPage.getContent());
            return new PageImpl<>(content, pageable, projectionPage.getTotalElements());

    }

    @Override
    public Page<?> searchProductsByLibelle(String libelle, Pageable pageable) {
        Page<ProductVenteProjection> projectionPage = produitRepository.searchProductsByLibelle(libelle, pageable);
        List<?> content = produitVenteMapper.toWebDTOList(projectionPage.getContent());
        return new PageImpl<>(content, pageable, projectionPage.getTotalElements());
    }

    @Override
    public Page<VenteJourResponseDTO> getTodaySales(Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Page<VenteProjection> projections = venteRepository.findTodaySales(startOfDay, endOfDay, minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getTodaySalesTotalAmount(Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return venteRepository.sumTodaySales(startOfDay, endOfDay, minAmount, maxAmount, modePaiement);
    }

    @Override
    public Page<VenteJourResponseDTO> getLast7DaysSales(Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(sevenDaysAgo, now, minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getLast7DaysSalesTotalAmount(Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        return venteRepository.sumSalesBetween(sevenDaysAgo, now, minAmount, maxAmount, modePaiement);
    }

    @Override
    public Page<VenteJourResponseDTO> getMonthSales(Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfMonth, startOfNextMonth, minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getMonthSalesTotalAmount(Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        return venteRepository.sumSalesBetween(startOfMonth, startOfNextMonth, minAmount, maxAmount, modePaiement);
    }

    @Override
    public Page<VenteJourResponseDTO> getYearSales(Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime startOfNextYear = startOfYear.plusYears(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfYear, startOfNextYear, minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getYearSalesTotalAmount(Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime startOfNextYear = startOfYear.plusYears(1);
        return venteRepository.sumSalesBetween(startOfYear, startOfNextYear, minAmount, maxAmount, modePaiement);
    }

    @Override
    public Page<VenteJourResponseDTO> getSalesByExactDate(LocalDate date, Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Page<VenteProjection> projections = venteRepository.findSalesBetween(startOfDay, endOfDay, minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getSalesByExactDateTotalAmount(LocalDate date, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return venteRepository.sumSalesBetween(startOfDay, endOfDay, minAmount, maxAmount, modePaiement);
    }

    @Override
    public Page<VenteJourResponseDTO> getAllSales(Pageable pageable, Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        Page<VenteProjection> projections = venteRepository.findAllSales(minAmount, maxAmount, modePaiement, pageable);
        return buildVenteJourPageResponse(projections);
    }

    public double getAllSalesTotalAmount(Double minAmount, Double maxAmount, ModePaiement modePaiement) {
        return venteRepository.sumAllSales(minAmount, maxAmount, modePaiement);
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