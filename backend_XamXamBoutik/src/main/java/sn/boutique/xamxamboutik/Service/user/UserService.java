package sn.boutique.xamxamboutik.Service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.Projection.UserProjection;
import sn.boutique.xamxamboutik.Repository.utilisateur.UtilisateurRepository;
import sn.boutique.xamxamboutik.Service.base.AbstractBaseService;
import sn.boutique.xamxamboutik.Web.DTO.Mapper.UserMapper;
import sn.boutique.xamxamboutik.Web.DTO.Request.UserRequestDTO;
import sn.boutique.xamxamboutik.security.repository.RefreshTokenRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService extends AbstractBaseService<Utilisateur> implements IUserService {
    private final UtilisateurRepository utilisateurRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    protected UtilisateurRepository getRepository() {
        return utilisateurRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Utilisateur> findAllActive(Pageable pageable) {
        return utilisateurRepository.findAllActive(sorted(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Utilisateur> findAllDeleted(Pageable pageable) {
        return utilisateurRepository.findAllDeleted(sorted(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserProjection> findAllProjected(Pageable pageable) {
        return utilisateurRepository.findAllProjectedBy(sorted(pageable), UserProjection.class);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Utilisateur> findById(Long id) {
        return utilisateurRepository.findById(id);
    }

    @Override
    @Transactional
    public Utilisateur save(UserRequestDTO dto) {
        Utilisateur utilisateur = userMapper.toEntity(dto);
        utilisateur.setPassword(passwordEncoder.encode(dto.getPassword()));
        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);
        notifyUpdate("CREATE", savedUtilisateur);
        return savedUtilisateur;
    }

    @Override
    @Transactional
    public Utilisateur update(UserRequestDTO dto) {
        Objects.requireNonNull(dto.getId(), "ID manquant");
        Utilisateur existing = findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur " + dto.getId(), ErrorCodes.ENTITY_NOT_FOUND));

        // Vérifier l'unicité du login
        if (!existing.getLogin().equals(dto.getLogin()) && utilisateurRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Le login " + dto.getLogin() + " est déjà utilisé");
        }

        // Mettre à jour les champs de l'entité existante
        existing.setNom(dto.getNom());
        existing.setLogin(dto.getLogin());
        existing.setRole(dto.getRole());
        // Conserver le mot de passe existant sauf si un nouveau est fourni
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        Utilisateur updatedUtilisateur = utilisateurRepository.save(existing);
        notifyUpdate("UPDATE", updatedUtilisateur);
        return updatedUtilisateur;
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        super.deleteById(id);
        notifyUpdate("DELETE", id);
    }

    @Override
    @Transactional
    public Utilisateur updatePassword(Long id, String newPassword) {
        log.debug("Mise à jour du mot de passe pour utilisateur id={}, mot de passe brut={}", id, newPassword);
        Utilisateur utilisateur = findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur " + id, ErrorCodes.ENTITY_NOT_FOUND));
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nouveau mot de passe ne peut pas être vide");
        }
        utilisateur.setPassword(passwordEncoder.encode(newPassword));
        log.debug("Mot de passe encodé pour utilisateur id={}: {}", id, utilisateur.getPassword());
        Utilisateur updated = utilisateurRepository.save(utilisateur);

        // Supprimer tous les tokens de rafraîchissement associés à l'utilisateur
        refreshTokenRepository.deleteAllByUser(updated);

        // Invalider la session actuelle
        SecurityContextHolder.clearContext();

        notifyUpdate("UPDATE_PASSWORD", updated);
        return updated;
    }

    @Override
    @Transactional
    public Utilisateur restore(Long id) {
        Utilisateur utilisateur = findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur " + id, ErrorCodes.ENTITY_NOT_FOUND));
        if (!utilisateur.isDeleted()) {
            throw new EntityNotFoundException("L'utilisateur n'est pas supprimé", ErrorCodes.INVALID_REQUEST);
        }
        utilisateur.setDeleted(false);
        utilisateur.setDeletedAt(null);
        utilisateur.setDeletedBy(null);
        Utilisateur restoredUtilisateur = utilisateurRepository.save(utilisateur);
        notifyUpdate("RESTORE", restoredUtilisateur);
        return restoredUtilisateur;
    }

    private void notifyUpdate(String action, Utilisateur utilisateur) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", action);
        message.put("userId", utilisateur.getId());
        message.put("nom", utilisateur.getNom());
        message.put("login", utilisateur.getLogin());
        message.put("role", utilisateur.getRole());
        messagingTemplate.convertAndSend("/topic/users", message);
    }

    private void notifyUpdate(String action, Long userId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", action);
        message.put("userId", userId);
        messagingTemplate.convertAndSend("/topic/users", message);
    }

    private Pageable sorted(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}