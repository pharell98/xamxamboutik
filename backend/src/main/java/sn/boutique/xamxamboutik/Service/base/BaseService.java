package sn.boutique.xamxamboutik.Service.base;
import sn.boutique.xamxamboutik.Entity.interfaces.Identifiable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import java.util.Optional;
public interface BaseService<T extends Identifiable<Long>, ID> {
    Page<T> findAll(Pageable pageable) throws BaseCustomException;
    <R> Page<R> findAll(Pageable pageable, Class<R> type) throws BaseCustomException;
    Optional<T> findById(ID id) throws BaseCustomException;
    T save(T entity) throws BaseCustomException;
    void deleteById(ID id) throws BaseCustomException;
    T update(T entity) throws BaseCustomException;
}
