package sn.boutique.xamxamboutik.Service.approvisionnement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Entity.approvisionnement.DetailAppro;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProductProjection;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProjection;
import sn.boutique.xamxamboutik.Repository.approvisionnement.ApprovisionnementRepository;
import sn.boutique.xamxamboutik.Repository.approvisionnement.DetailApproRepository;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Service.produit.CategorieService;
import sn.boutique.xamxamboutik.Service.imageservice.service.ImageBackgroundService;
import sn.boutique.xamxamboutik.Util.ProduitUtils;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ApprovisionnementMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitExistantDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ApprovisionnementProductDTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.util.Objects.requireNonNull;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApprovisionnementService implements IApprovisionnementService {

    /*=======================  Constantes  =======================*/
    private static final String CODE_APPRO_EXCEL_PREFIX = "APPRO-EXCEL-";
    private static final String EXCEL_APPRO_DATE_PATTERN = "yyyy-MM-dd-HHmmss";

    /*=======================  Dépendances  =======================*/
    private final ApprovisionnementRepository approvisionnementRepository;
    private final DetailApproRepository detailApproRepository;
    private final ProduitRepository produitRepository;
    private final ApprovisionnementMapper approvisionnementMapper;
    private final CategorieService categorieService;
    private final ImageBackgroundService imageBackgroundService;
    private final SimpMessagingTemplate messagingTemplate;

    /*=============================================================
                          Approvisionnement CLASSIQUE
     =============================================================*/
    @Override
    public Approvisionnement createApprovisionnement(ApprovisionnementRequestDTO dto,
                                                     MultipartFile[] newProduitImages) {

        requireNonNull(dto, "Le DTO d'approvisionnement ne peut pas être nul");

        /* -------- Validation rapide -------- */
        List<String> errors = new ArrayList<>();
        if (dto.getProduitExitant() != null) {
            for (ProduitExistantDTO pe : dto.getProduitExitant()) {
                if (pe.getQuantite() == null || pe.getQuantite() <= 0)
                    errors.add("Quantité invalide pour le produit existant ID " + pe.getId());
                if (!produitRepository.existsById(Long.valueOf(pe.getId())))
                    errors.add("Produit existant ID " + pe.getId() + " introuvable");
            }
        }
        if (!errors.isEmpty())
            throw new IllegalArgumentException(String.join(" | ", errors));

        /* -------- Création -------- */
        Approvisionnement appro = approvisionnementMapper.toEntity(dto);
        appro.setDate(LocalDateTime.now());
        // fraisTransport est déjà mappé depuis dto
        appro = approvisionnementRepository.save(appro);

        processExistingProducts(appro, dto.getProduitExitant(), dto.getFraisTransport());
        processNewProducts(appro, dto.getNewproduit(), newProduitImages, dto.getFraisTransport());
        finalizeApproCosts(appro, dto.getFraisTransport());

        Approvisionnement savedAppro = approvisionnementRepository.save(appro);
        notifyUpdate();
        return savedAppro;
    }

    /*=============================================================
                          Approvisionnement EXCEL
     =============================================================*/
    @Override
    public Approvisionnement createApprovisionnementExcelBatch(String codeAppro) {
        Approvisionnement a = new Approvisionnement();
        a.setDate(LocalDateTime.now());
        a.setCodeAppro(codeAppro);
        a.setMontantAppro(0.0);
        a.setFraisTransport(0.0);
        a.setDetailAppros(new HashSet<>());
        return a; // pas de save ici
    }

    @Override
    public void addExcelDetail(Approvisionnement appro, Produit produit, int qty, Double prix) {
        DetailAppro d = new DetailAppro();
        d.setApprovisionnement(appro);
        d.setProduit(produit);
        d.setQuantiteAchat(qty);
        d.setPrixAchat(prix);
        appro.getDetailAppros().add(d);
    }

    @Override
    public void finalizeAndSaveApprovisionnement(Approvisionnement appro) {
        if (appro.getDetailAppros().isEmpty()) {
            throw new IllegalStateException("Aucun produit valide — approvisionnement annulé");
        }
        double totalDetails = appro.getDetailAppros().stream()
                .mapToDouble(d -> d.getPrixAchat() * d.getQuantiteAchat())
                .sum();
        double frais = Optional.ofNullable(appro.getFraisTransport()).orElse(0.0);
        appro.setMontantAppro(totalDetails + frais);
        approvisionnementRepository.save(appro); // cascade = détails enregistrés
        notifyUpdate();
    }

    @Override
    public String generateExcelApproCode() {
        String base = CODE_APPRO_EXCEL_PREFIX +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern(EXCEL_APPRO_DATE_PATTERN));
        String code = base;
        int i = 1;
        while (approvisionnementRepository.existsByCodeAppro(code)) {
            code = base + "-" + i++;
        }
        return code;
    }

    /*=============================================================
                         Approvisionnement VIRTUEL
     =============================================================*/
    @Override
    public Approvisionnement createApprovisionnementVirtuel(Produit p, int q, Double prix) {
        Approvisionnement a = new Approvisionnement();
        a.setDate(LocalDateTime.now());
        a.setCodeAppro("APPRO-VIRTUEL-" + p.getId() + "-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss")));
        a.setFraisTransport(0.0);
        a.setMontantAppro(prix * q);
        a = approvisionnementRepository.save(a);

        DetailAppro d = new DetailAppro();
        d.setApprovisionnement(a);
        d.setProduit(p);
        d.setQuantiteAchat(q);
        d.setPrixAchat(prix);
        DetailAppro savedVirtDetail = detailApproRepository.save(d);
        a.getDetailAppros().add(savedVirtDetail);

        // Mettre à jour le dernier prix d'achat
        p.setPrixAchat(prix);
        produitRepository.save(p);

        notifyUpdate();
        return a;
    }

    /*=============================================================
                              Lecture
     =============================================================*/
    @Override
    public Page<ApprovisionnementProjection> getAllApprovisionnements(Pageable pg) {
        return approvisionnementRepository
                .findAllProjectedByOrderByDateDesc(pg, ApprovisionnementProjection.class);
    }

    @Override
    public Page<ApprovisionnementProductDTO> getProductsByApprovisionnement(Long id, Pageable pg) {
        Page<ApprovisionnementProductProjection> proj =
                detailApproRepository.findByApprovisionnement_Id(id, pg, ApprovisionnementProductProjection.class);
        List<ApprovisionnementProductDTO> dtos =
                approvisionnementMapper.toProductDTOsFromProjection(proj.getContent());
        return new PageImpl<>(dtos, pg, proj.getTotalElements());
    }

    /*=============================================================
                       Helpers internes (classique)
     =============================================================*/
    private void processExistingProducts(Approvisionnement appro, List<ProduitExistantDTO> list, Double fraisTransport) {
        if (list == null) return;

        // Calculer la quantité totale pour répartir les frais de transport
        int totalQuantite = list.stream().mapToInt(ProduitExistantDTO::getQuantite).sum();
        double fraisParUnite = (fraisTransport != null && totalQuantite > 0) ? fraisTransport / totalQuantite : 0.0;

        for (ProduitExistantDTO dto : list) {
            Produit p = produitRepository.findById(Long.valueOf(dto.getId()))
                    .orElseThrow(() -> new EntityNotFoundException("Produit ID " + dto.getId(), ErrorCodes.ENTITY_NOT_FOUND));
            int oldStock = p.getStockDisponible();
            double oldCMA = p.getCoupMoyenAcquisition();
            int newStock = dto.getQuantite();
            double newPrixAchat = dto.getPrixAchat() + fraisParUnite; // Inclure les frais de transport

            // Calcul du coût moyen d'acquisition
            double nouveauCMA = ProduitUtils.calculerCoupMoyenAcquisition(oldStock, oldCMA, newStock, newPrixAchat);
            p.setCoupMoyenAcquisition(nouveauCMA);
            p.setStockDisponible(oldStock + newStock);
            p.setPrixAchat(dto.getPrixAchat()); // Mettre à jour le dernier prix d'achat
            produitRepository.save(p);

            DetailAppro d = new DetailAppro();
            d.setApprovisionnement(appro);
            d.setProduit(p);
            d.setQuantiteAchat(newStock);
            d.setPrixAchat(dto.getPrixAchat());
            DetailAppro savedDetail = detailApproRepository.save(d);
            appro.getDetailAppros().add(savedDetail);
        }
    }

    private void processNewProducts(Approvisionnement appro, List<ProduitRequestDTO> list, MultipartFile[] imgs, Double fraisTransport) {
        if (list == null) return;

        // Calculer la quantité totale pour répartir les frais de transport
        int totalQuantite = list.stream().mapToInt(ProduitRequestDTO::getStockDisponible).sum();
        double fraisParUnite = (fraisTransport != null && totalQuantite > 0) ? fraisTransport / totalQuantite : 0.0;

        for (ProduitRequestDTO dto : list) {
            Produit p = new Produit();
            p.setCodeProduit(dto.getCodeProduit());
            p.setLibelle(dto.getLibelle());
            p.setPrixAchat(dto.getPrixAchat()); // Définir le dernier prix d'achat
            p.setPrixVente(dto.getPrixVente());
            double nouveauCMA = dto.getPrixAchat() + fraisParUnite; // Inclure les frais de transport
            nouveauCMA = Math.round(nouveauCMA * 100.0) / 100.0; // Arrondi à 2 décimales
            p.setCoupMoyenAcquisition(nouveauCMA);
            p.setStockDisponible(dto.getStockDisponible());
            p.setSeuilRuptureStock(dto.getSeuilRuptureStock());
            p.setCategorie(categorieService.findById(dto.getCategorieId()).orElseThrow());
            if (dto.getImageURL() != null) p.setImage(dto.getImageURL());
            Produit saved = produitRepository.save(p);

            DetailAppro d = new DetailAppro();
            d.setApprovisionnement(appro);
            d.setProduit(saved);
            d.setQuantiteAchat(dto.getStockDisponible());
            d.setPrixAchat(dto.getPrixAchat());
            DetailAppro savedDetail = detailApproRepository.save(d);
            appro.getDetailAppros().add(savedDetail);
        }
    }

    /**
     * Calcule et met à jour le montantAppro en incluant les frais de transport.
     */
    private void finalizeApproCosts(Approvisionnement appro, Double fraisTransport) {
        double totalDetails = appro.getDetailAppros().stream()
                .mapToDouble(d -> d.getPrixAchat() * d.getQuantiteAchat())
                .sum();
        double frais = Optional.ofNullable(fraisTransport).orElse(0.0);
        appro.setMontantAppro(totalDetails + frais);
    }

    /**
     * Envoie une notification WebSocket pour signaler une mise à jour des approvisionnements.
     */
    private void notifyUpdate() {
        messagingTemplate.convertAndSend("/topic/approvisionnements", "update");
    }
}