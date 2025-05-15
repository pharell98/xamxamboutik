package sn.boutique.xamxamboutik.Service.produit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.produit.Categorie;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import sn.boutique.xamxamboutik.Exception.DuplicateEntityException;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.produit.CategorieRepository;
import sn.boutique.xamxamboutik.Repository.Projection.CategorieProjection;
import sn.boutique.xamxamboutik.Service.base.AbstractBaseService;

import java.util.Optional;

import static java.util.Objects.requireNonNull;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategorieService extends AbstractBaseService<Categorie> {

    private final CategorieRepository categorieRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    protected CategorieRepository getRepository() {
        return categorieRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Categorie> findAll(Pageable pageable) throws BaseCustomException {
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findAllActive(sorted(pageable));
    }

    @Transactional(readOnly = true)
    public Optional<Categorie> findByLibelle(String libelle) {
        requireNonNull(libelle, "Le libellé est requis.");
        return categorieRepository.findByLibelle(libelle.toLowerCase());
    }

    @Transactional(readOnly = true)
    public Page<Categorie> searchByLibelle(String libelle, Pageable pageable) {
        requireNonNull(libelle, "Le libellé est requis.");
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findByLibelleContainingIgnoreCase(libelle.toLowerCase(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<?> findAllProjection(Pageable pageable) throws BaseCustomException {
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findAll(sorted(pageable), CategorieProjection.class);
    }

    @Transactional(readOnly = true)
    public Page<Categorie> findAllDeleted(Pageable pageable) throws BaseCustomException {
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findAllDeleted(pageable);
    }

    @Transactional(readOnly = true)
    public Page<?> searchByLibelleProjection(String libelle, Pageable pageable) {
        requireNonNull(libelle, "Le libellé est requis.");
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findByLibelleContainingIgnoreCase(libelle.toLowerCase(), pageable, CategorieProjection.class);
    }

    @Transactional(readOnly = true)
    public Page<?> suggestionsByLibelleProjection(String prefix, Pageable pageable) {
        requireNonNull(prefix, "Le préfixe est requis.");
        requireNonNull(pageable, "Les paramètres de pagination sont requis.");
        return categorieRepository.findByLibelleStartingWithIgnoreCase(prefix.toLowerCase(), pageable, CategorieProjection.class);
    }

    @Override
    @Transactional
    public Categorie save(Categorie entity) throws DuplicateEntityException, BaseCustomException {
        requireNonNull(entity, "La catégorie est requise.");
        requireNonNull(entity.getLibelle(), "Le libellé de la catégorie est requis.");
        entity.setLibelle(entity.getLibelle().toLowerCase());
        if (categorieRepository.existsByLibelleAndDeletedFalse(entity.getLibelle())) {
            throw new DuplicateEntityException("La catégorie '" + entity.getLibelle() + "' existe déjà.");
        }
        Categorie saved = super.save(entity);
        notifyUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Categorie update(Categorie entity) throws EntityNotFoundException, BaseCustomException {
        requireNonNull(entity, "La catégorie est requise.");
        requireNonNull(entity.getId(), "L'ID de la catégorie est requis.");
        Categorie existing = categorieRepository.findById(entity.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Catégorie avec l'ID " + entity.getId() + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND));
        entity.setLibelle(entity.getLibelle().toLowerCase());
        if (!existing.getLibelle().equals(entity.getLibelle()) &&
                categorieRepository.existsByLibelleAndDeletedFalse(entity.getLibelle())) {
            throw new DuplicateEntityException("La catégorie '" + entity.getLibelle() + "' existe déjà.");
        }
        entity.setVersion(existing.getVersion());
        Categorie updated = categorieRepository.save(entity);
        notifyUpdate();
        return updated;
    }

    @Override
    @Transactional
    public void deleteById(Long id) throws EntityNotFoundException, BaseCustomException {
        requireNonNull(id, "L'ID de la catégorie est requis.");
        Categorie cat = categorieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + id + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND));
        if (categorieRepository.countProduitsByCategorie(id) > 0) {
            throw new BaseCustomException("Impossible de supprimer : la catégorie est utilisée par des produits.", "INVALID_REQUEST");
        }
        super.deleteById(id);
        notifyUpdate();
    }

    @Transactional
    public Categorie restore(Long id) throws EntityNotFoundException, BaseCustomException {
        requireNonNull(id, "L'ID de la catégorie est requis.");
        Categorie cat = categorieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + id + " non trouvée.", ErrorCodes.ENTITY_NOT_FOUND));
        if (!cat.isDeleted()) {
            throw new BaseCustomException("La catégorie n'est pas supprimée.", "INVALID_REQUEST");
        }
        categorieRepository.restore(id);
        Categorie restored = categorieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Catégorie avec l'ID " + id + " non trouvée après restauration.", ErrorCodes.ENTITY_NOT_FOUND));
        notifyUpdate();
        return restored;
    }

    private Pageable sorted(Pageable pg) {
        return PageRequest.of(pg.getPageNumber(), pg.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    private void notifyUpdate() {
        messagingTemplate.convertAndSend("/topic/categories", "update");
    }
}