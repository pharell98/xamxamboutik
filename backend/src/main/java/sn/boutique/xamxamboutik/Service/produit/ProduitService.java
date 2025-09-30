package sn.boutique.xamxamboutik.Service.produit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import sn.boutique.xamxamboutik.Repository.Projection.ProduitEchangeProjection;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitProjection;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Service.base.AbstractBaseService;
import sn.boutique.xamxamboutik.Service.imageservice.service.ImageBackgroundService;
import sn.boutique.xamxamboutik.Util.ProduitUtils;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.ProduitMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.AddApproProductLibelleSearchResponseDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

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

    @Override
    protected ProduitRepository getRepository() {
        return produitRepository;
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Produit produit = getRepository().findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + id + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND));
        getRepository().softDelete(id);
        notifyUpdate(produit, "DELETE");
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
        notifyUpdate(saved, "CREATE");
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
        notifyUpdate(saved, "CREATE");
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
        notifyUpdate(updated, "UPDATE");
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

        if (produitRepository.existsByLibelleAndDeletedFalseAndIdNot(produit.getLibelle(), produit.getId())) {
            throw new BaseCustomException("Le produit '" + produit.getLibelle() + "' existe déjà.", "DUPLICATE_ENTITY");
        }

        Produit updated = produitRepository.save(produit);

        notifyUpdate(updated, "UPDATE");
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Produit> findByCode(String c) {
        requireNonNull(c, "Le code du produit est requis.");
        return produitRepository.findByCodeProduit(c);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Produit> findByLibelleAndCategorie(String libelle, Long categorieId) {
        requireNonNull(libelle, "Le libellé du produit est requis.");
        requireNonNull(categorieId, "L'ID de la catégorie est requis.");
        return produitRepository.findByLibelleAndCategorie_IdAndDeletedFalse(libelle.toLowerCase(), categorieId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Produit> findByLibelleOnly(String libelle) {
        requireNonNull(libelle, "Le libellé du produit est requis.");
        return produitRepository.findByLibelleAndDeletedFalse(libelle.toLowerCase());
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
        notifyUpdate(restored, "RESTORE");
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

    @Override
    @Transactional
    public Produit updateStockAndPrice(Long produitId, int quantiteAjoutee, double prixAchat) {
        requireNonNull(produitId, "L'ID du produit est requis.");
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new EntityNotFoundException("Produit avec l'ID " + produitId + " non trouvé.", ErrorCodes.ENTITY_NOT_FOUND));
        int oldStock = produit.getStockDisponible();
        double oldCMA = produit.getCoupMoyenAcquisition();
        int newStock = quantiteAjoutee;
        double nouveauCMA = ProduitUtils.calculerCoupMoyenAcquisition(oldStock, oldCMA, newStock, prixAchat);
        produit.setCoupMoyenAcquisition(nouveauCMA);
        produit.setStockDisponible(oldStock + newStock);
        produit.setPrixAchat(prixAchat);
        Produit updated = produitRepository.save(produit);
        notifyUpdate(updated, "UPDATE");
        return updated;
    }

    @Override
    public boolean existsById(Long id) {
        return produitRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public List<ProduitEchangeProjection> findProduitsEchange() {
        return produitRepository.findProduitsEchange();
    }

    private Produit buildProduit(ProduitRequestDTO dto) {
        Categorie cat = categorieService.findById(dto.getCategorieId())
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + dto.getCategorieId() + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND));
        Produit p = produitMapper.toEntity(dto);
        p.setLibelle(p.getLibelle().trim().toLowerCase());
        p.setCategorie(cat);
        p.setStockDisponible(Objects.requireNonNullElse(dto.getStockDisponible(), 0));
        double pa = Objects.requireNonNullElse(dto.getPrixAchat(), 0.0);
        p.setPrixAchat(pa);
        p.setCoupMoyenAcquisition(pa);
        return p;
    }

    private void updateProduitFields(Produit p, ProduitRequestDTO dto) {
        p.setCodeProduit(dto.getCodeProduit());
        p.setLibelle(dto.getLibelle().trim().toLowerCase());
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
            String oldId = extractCloudinaryPublicId(p.getImage());
            if (oldId != null && isCloudinaryUrl(p.getImage())) {
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
                String oldId = extractCloudinaryPublicId(p.getImage());
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
            // approvisionnementService.createApprovisionnementVirtuel(p, q, pa);
            p.setCoupMoyenAcquisition(ProduitUtils.calculerCoupMoyenAcquisition(
                    p.getStockDisponible() - q, p.getCoupMoyenAcquisition(), q, pa));
            produitRepository.save(p);
        }
    }

    private void notifyUpdate(Produit produit, String action) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("action", action);
            message.put("productId", produit.getId());
            message.put("libelle", produit.getLibelle());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/updates", message);
                log.info("Message STOMP envoyé à /topic/updates pour produit ID: {}", produit.getId());
            } else {
                log.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour produit ID: {}", produit.getId());
            }
        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification WebSocket pour le produit {}: {}", produit.getId(), e.getMessage());
        }
    }

    private boolean isCloudinaryUrl(String url) {
        if (url == null) return false;
        try {
            java.net.URI uri = java.net.URI.create(url);
            String host = uri.getHost();
            return host != null && host.contains("res.cloudinary.com");
        } catch (Exception ignored) {
            return false;
        }
    }

    private String extractCloudinaryPublicId(String url) {
        if (!isCloudinaryUrl(url)) {
            return null;
        }
        try {
            // Example: https://res.cloudinary.com/<cloud>/image/upload/v12345/folder/name.jpg
            // We want: folder/name (without extension and version)
            String path = java.net.URI.create(url).getPath();
            // Find the segment after "/upload/"
            int uploadIdx = path.indexOf("/upload/");
            if (uploadIdx == -1) {
                return null;
            }
            String afterUpload = path.substring(uploadIdx + "/upload/".length());
            // Remove transformation segments if any (start with "c_", "w_" etc.) which appear before the version
            // Cloudinary typically puts version as v12345, so strip a leading v{digits}/ if present
            afterUpload = afterUpload.replaceFirst("^v\\d+/", "");
            // Now remove file extension
            int lastSlash = afterUpload.lastIndexOf('/');
            String filePart = afterUpload.substring(lastSlash + 1);
            int dotIdx = filePart.lastIndexOf('.');
            String fileNoExt = (dotIdx > 0) ? filePart.substring(0, dotIdx) : filePart;
            if (lastSlash >= 0) {
                String folder = afterUpload.substring(0, lastSlash);
                return folder.isEmpty() ? fileNoExt : folder + "/" + fileNoExt;
            } else {
                return fileNoExt;
            }
        } catch (Exception e) {
            return null;
        }
    }

    private Pageable sorted(Pageable pg) {
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}