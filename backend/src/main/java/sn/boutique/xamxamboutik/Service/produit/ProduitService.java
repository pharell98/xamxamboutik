package sn.boutique.xamxamboutik.Service.produit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.produit.Categorie;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitProjection;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Service.approvisionnement.ApprovisionnementService;
import sn.boutique.xamxamboutik.Service.base.AbstractBaseService;
import sn.boutique.xamxamboutik.Service.imageservice.service.ImageBackgroundService;
import sn.boutique.xamxamboutik.Util.ProduitUtils;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;

import java.util.*;

import static java.util.Objects.requireNonNull;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProduitService extends AbstractBaseService<Produit> implements IProduitService {

    private final ProduitRepository produitRepository;
    @Getter
    private final CategorieService categorieService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ImageBackgroundService imageBackgroundService;
    private final ProduitMapper produitMapper;
    private final ApprovisionnementService approvisionnementService;

    @Override
    protected ProduitRepository getRepository() {
        return produitRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProduitProjection> findAllProjection(Pageable pg) {
        requireNonNull(pg, "Les paramètres de pagination sont requis.");
        return produitRepository.findAll(sorted(pg), ProduitProjection.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProduitProjection> findDeletedProjection(Pageable pg) {
        requireNonNull(pg, "Les paramètres de pagination sont requis.");
        return produitRepository.findByDeletedTrue(sorted(pg), ProduitProjection.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProduitProjection> findByCategoryId(Long categoryId, Pageable pg) {
        requireNonNull(categoryId, "L'ID de la catégorie est requis.");
        requireNonNull(pg, "Les paramètres de pagination sont requis.");
        return produitRepository.findByCategorie_Id(categoryId, sorted(pg), ProduitProjection.class);
    }

    @Override
    @Transactional
    public Produit save(ProduitRequestDTO dto, MultipartFile file) throws Exception {
        requireNonNull(dto, "Les données du produit sont requises.");
        Produit produit = buildProduit(dto);
        if (produitRepository.existsByLibelleAndDeletedFalse(produit.getLibelle().toLowerCase())) {
            throw new BaseCustomException("Le produit '" + produit.getLibelle() + "' existe déjà.", "DUPLICATE_ENTITY");
        }
        Produit saved = produitRepository.save(produit);
        handleImageUpload(saved, file, dto.getImageURL());
        handleInitialStock(saved, dto);
        notifyUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Produit saveWithoutAppro(ProduitRequestDTO dto, MultipartFile file) throws Exception {
        requireNonNull(dto, "Les données du produit sont requises.");
        Produit produit = buildProduit(dto);
        if (produitRepository.existsByLibelleAndDeletedFalse(produit.getLibelle().toLowerCase())) {
            throw new BaseCustomException("Le produit '" + produit.getLibelle() + "' existe déjà.", "DUPLICATE_ENTITY");
        }
        Produit saved = produitRepository.save(produit);
        handleImageUpload(saved, file, dto.getImageURL());
        notifyUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Produit update(ProduitRequestDTO dto, MultipartFile file) throws Exception {
        requireNonNull(dto.getId(), "L'ID du produit est requis.");
        Produit existing = produitRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + dto.getId() + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND));
        updateProduitFields(existing, dto);
        if (!existing.getLibelle().equals(dto.getLibelle().toLowerCase()) &&
                produitRepository.existsByLibelleAndDeletedFalse(dto.getLibelle().toLowerCase())) {
            throw new BaseCustomException("Le produit '" + dto.getLibelle() + "' existe déjà.", "DUPLICATE_ENTITY");
        }
        handleImageUpdate(existing, file, dto.getImageURL());
        Produit updated = produitRepository.save(existing);
        notifyUpdate();
        return updated;
    }

    @Override
    @Transactional
    public Produit update(Produit produit) {
        requireNonNull(produit, "Le produit est requis.");
        requireNonNull(produit.getId(), "L'ID du produit est requis.");
        if (!produitRepository.existsById(produit.getId())) {
            throw new EntityNotFoundException("Produit avec l'ID " + produit.getId() + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND);
        }
        produit.setLibelle(produit.getLibelle().toLowerCase());
        if (produitRepository.existsByLibelleAndDeletedFalseAndIdNot(produit.getLibelle(), produit.getId())) {
            throw new BaseCustomException("Le produit '" + produit.getLibelle() + "' existe déjà.", "DUPLICATE_ENTITY");
        }
        Produit updated = produitRepository.save(produit);
        notifyUpdate();
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Produit> findByCode(String c) {
        requireNonNull(c, "Le code du produit est requis.");
        return produitRepository.findByCodeProduit(c);
    }

    @Override
    @Transactional
    public Produit restore(Long id) {
        requireNonNull(id, "L'ID du produit est requis.");
        Produit p = produitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + id + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND));
        if (!p.isDeleted()) {
            throw new BaseCustomException("Le produit n'est pas supprimé.", "INVALID_REQUEST");
        }
        produitRepository.restore(id);
        Produit restored = produitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + id + " non trouvé après restauration.", ErrorCodes.ENTITY_NOT_FOUND));
        notifyUpdate();
        return restored;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProduitProjection> suggestionsByLibelleProjection(String pfx, Pageable pg) {
        requireNonNull(pfx, "Le préfixe est requis.");
        requireNonNull(pg, "Les paramètres de pagination sont requis.");
        return produitRepository.findByLibelleStartingWithIgnoreCase(pfx.toLowerCase(), sorted(pg), ProduitProjection.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AddApproProductLibelleSearchResponseDTO> suggestionsForApprovisionnement(String pfx, Pageable pg) {
        requireNonNull(pfx, "Le préfixe est requis.");
        requireNonNull(pg, "Les paramètres de pagination sont requis.");
        return produitRepository.findApprovisionnementSuggestions(pfx.toLowerCase(), sorted(pg));
    }

    @Transactional
    public Produit updateStock(Long produitId, int quantite, Double prixAchat) {
        requireNonNull(produitId, "L'ID du produit est requis.");
        if (quantite == 0) {
            throw new IllegalArgumentException("La quantité doit être non nulle.");
        }

        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + produitId + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND));

        int oldStock = produit.getStockDisponible();
        double oldCMA = produit.getCoupMoyenAcquisition();
        double prix = prixAchat != null ? prixAchat : produit.getPrixAchat();

        int newStock = oldStock + quantite;
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock insuffisant pour cette opération.");
        }
        produit.setStockDisponible(newStock);

        if (quantite > 0) {
            double nouveauCMA = ProduitUtils.calculerCoupMoyenAcquisition(oldStock, oldCMA, quantite, prix);
            produit.setCoupMoyenAcquisition(nouveauCMA);
            produit.setPrixAchat(prix);
        }

        approvisionnementService.createApprovisionnementVirtuel(produit, quantite, prix);

        Produit updated = produitRepository.save(produit);
        notifyUpdate();
        return updated;
    }

    private Produit buildProduit(ProduitRequestDTO dto) {
        Categorie cat = categorieService.findById(dto.getCategorieId())
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + dto.getCategorieId() + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND));
        Produit p = produitMapper.toEntity(dto);
        p.setLibelle(p.getLibelle().toLowerCase());
        p.setCategorie(cat);
        p.setStockDisponible(Objects.requireNonNullElse(dto.getStockDisponible(), 0));
        double pa = Objects.requireNonNullElse(dto.getPrixAchat(), 0.0);
        p.setPrixAchat(pa);
        p.setCoupMoyenAcquisition(pa);
        return p;
    }

    private void updateProduitFields(Produit p, ProduitRequestDTO dto) {
        p.setCodeProduit(dto.getCodeProduit());
        p.setLibelle(dto.getLibelle().toLowerCase());
        p.setPrixAchat(Objects.requireNonNullElse(dto.getPrixAchat(), 0.0));
        p.setPrixVente(Objects.requireNonNullElse(dto.getPrixVente(), 0.0));
        p.setSeuilRuptureStock(Objects.requireNonNullElse(dto.getSeuilRuptureStock(), 0));
        p.setCategorie(categorieService.findById(dto.getCategorieId())
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + dto.getCategorieId() + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND)));
    }

    private void handleImageUpload(Produit p, MultipartFile file, String url) {
        if (url != null) {
            p.setImage(url);
            return;
        }
        if (file != null && !file.isEmpty()) {
            try {
                byte[] data = file.getBytes();
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        imageBackgroundService.uploadImageAsync(p.getId(), data, file.getOriginalFilename());
                    }
                });
                p.setImage(file.getOriginalFilename());
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors du traitement de l'image.", e);
            }
        }
    }

    private void handleImageUpdate(Produit p, MultipartFile file, String url) {
        if (url != null) {
            String oldId = extractPublicId(p.getImage());
            if (oldId != null) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        imageBackgroundService.deleteImageAsync(oldId);
                    }
                });
            }
            p.setImage(url);
            return;
        }
        if (file != null && !file.isEmpty()) {
            try {
                byte[] data = file.getBytes();
                String oldId = extractPublicId(p.getImage());
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        imageBackgroundService.replaceImageAsync(p.getId(), oldId, data, file.getOriginalFilename());
                    }
                });
                p.setImage(file.getOriginalFilename());
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la mise à jour de l'image.", e);
            }
        }
    }

    private void handleInitialStock(Produit p, ProduitRequestDTO dto) {
        int q = Objects.requireNonNullElse(dto.getStockDisponible(), 0);
        if (q > 0) {
            double pa = Objects.requireNonNullElse(dto.getPrixAchat(), 0.0);
            approvisionnementService.createApprovisionnementVirtuel(p, q, pa);
            p.setCoupMoyenAcquisition(ProduitUtils.calculerCoupMoyenAcquisition(
                    p.getStockDisponible() - q, p.getCoupMoyenAcquisition(), q, pa));
            produitRepository.save(p);
        }
    }

    private void notifyUpdate() {
        messagingTemplate.convertAndSend("/topic/updates", "update");
    }

    private String extractPublicId(String url) {
        if (url == null || !url.contains("/")) {
            return null;
        }
        String[] part = url.split("/");
        return part[part.length - 1].split("\\.")[0];
    }

    private Pageable sorted(Pageable pg) {
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}