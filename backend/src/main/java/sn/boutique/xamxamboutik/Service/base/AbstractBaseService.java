package sn.boutique.xamxamboutik.Service.base;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.interfaces.Identifiable;
import sn.boutique.xamxamboutik.Exception.*;
import org.springframework.data.jpa.repository.JpaRepository;
import sn.boutique.xamxamboutik.Repository.base.SoftDeleteRepository;
import java.lang.reflect.Method;
import java.util.Optional;
@Transactional
public abstract class AbstractBaseService<T extends Identifiable<Long>> implements BaseService<T, Long> {
    protected abstract JpaRepository<T, Long> getRepository();
    @Override
    public Page<T> findAll(Pageable pageable) throws BaseCustomException {
        return getRepository().findAll(pageable);
    }
    @Override
    public <R> Page<R> findAll(Pageable pageable, Class<R> type) throws BaseCustomException {
        try {
            Method method = getRepository().getClass().getMethod("findAll", Pageable.class, Class.class);
            return (Page<R>) method.invoke(getRepository(), pageable, type);
        } catch (Exception e) {
            throw new BaseCustomException("La projection findAll n'est pas supportée par le repository. "
                    + e.getMessage(), "PROJECTION_ERROR");
        }
    }
    @Override
    public Optional<T> findById(Long id) throws EntityNotFoundException {
        return getRepository().findById(id)
                .or(() -> {
                    throw new EntityNotFoundException("Entity with ID " + id + " not found.", ErrorCodes.ENTITY_NOT_FOUND);
                });
    }
    @Override
    public T save(T entity) throws DuplicateEntityException, BaseCustomException {
        try {
            return getRepository().save(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("Entity could not be saved due to duplication or constraint violation.");
        } catch (Exception ex) {
            throw new InternalServiceException("An error occurred while saving the entity.", ex);
        }
    }
    @Override
    public void deleteById(Long id) throws EntityNotFoundException {
        if (!getRepository().existsById(id)) {
            throw new EntityNotFoundException("Entity with ID " + id + " not found for deletion.", ErrorCodes.ENTITY_NOT_FOUND);
        }
        if (getRepository() instanceof SoftDeleteRepository) {
            ((SoftDeleteRepository<T, Long>) getRepository()).softDelete(id);
        } else {
            getRepository().deleteById(id);
        }
    }
    @Override
    public T update(T entity) throws EntityNotFoundException {
        if (!getRepository().existsById(entity.getId())) {
            throw new EntityNotFoundException("Entity with ID " + entity.getId() + " not found for update.", ErrorCodes.ENTITY_NOT_FOUND);
        }
        return getRepository().save(entity);
    }
}
