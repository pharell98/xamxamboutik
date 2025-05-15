package sn.boutique.xamxamboutik.security.service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Exception.CustomAuthenticationException;
import sn.boutique.xamxamboutik.Repository.utilisateur.UtilisateurRepository;
import sn.boutique.xamxamboutik.security.constants.SecurityConstants;
import sn.boutique.xamxamboutik.security.model.AuthenticatedUser;
import java.util.Collections;
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {
    private final UtilisateurRepository utilisateurRepository;
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) {
        return utilisateurRepository.findByLogin(login)
                .map(this::createAuthenticatedUser)
                .orElseThrow(() -> {
                    return CustomAuthenticationException.userNotFound();
                });
    }
    private AuthenticatedUser createAuthenticatedUser(Utilisateur utilisateur) {
        String roleName = SecurityConstants.Defaults.ROLE_PREFIX + utilisateur.getRole().name();
        return AuthenticatedUser.builder()
                .id(utilisateur.getId())
                .username(utilisateur.getLogin())
                .password(utilisateur.getPassword())
                .authorities(Collections.singleton(new SimpleGrantedAuthority(roleName)))
                .utilisateur(utilisateur)  // On passe l'entité Utilisateur
                .build();
    }
}
