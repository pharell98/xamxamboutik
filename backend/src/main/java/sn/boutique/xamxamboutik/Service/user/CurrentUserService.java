package sn.boutique.xamxamboutik.Service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Exception.CustomAuthenticationException;
import sn.boutique.xamxamboutik.security.model.AuthenticatedUser;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    /**
     * Récupère l'utilisateur actuellement connecté depuis le contexte de sécurité
     *
     * @return L'entité Utilisateur connecté
     * @throws CustomAuthenticationException si aucun utilisateur n'est connecté
     */
    public Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomAuthenticationException("Aucun utilisateur connecté");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AuthenticatedUser)) {
            throw new CustomAuthenticationException("Utilisateur non authentifié correctement");
        }

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) principal;
        return authenticatedUser.getUtilisateur();
    }

    /**
     * Récupère l'ID de l'utilisateur actuellement connecté
     *
     * @return L'ID de l'utilisateur connecté
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Vérifie si un utilisateur est actuellement connecté
     *
     * @return true si un utilisateur est connecté, false sinon
     */
    public boolean isUserAuthenticated() {
        try {
            getCurrentUser();
            return true;
        } catch (CustomAuthenticationException e) {
            return false;
        }
    }
}
