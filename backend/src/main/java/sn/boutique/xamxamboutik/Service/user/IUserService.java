package sn.boutique.xamxamboutik.Service.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Repository.Projection.UserProjection;
import sn.boutique.xamxamboutik.Service.base.BaseService;
import sn.boutique.xamxamboutik.Web.DTO.Request.UserRequestDTO;

import java.util.Optional;

public interface IUserService extends BaseService<Utilisateur, Long> {
    Page<Utilisateur> findAllActive(Pageable pageable);
    Page<Utilisateur> findAllDeleted(Pageable pageable);
    Page<UserProjection> findAllProjected(Pageable pageable);
    Optional<Utilisateur> findById(Long id);
    Utilisateur save(UserRequestDTO dto);
    Utilisateur update(UserRequestDTO dto);
    void deleteById(Long id);
    Utilisateur updatePassword(Long id, String newPassword);
    Utilisateur restore(Long id);
}