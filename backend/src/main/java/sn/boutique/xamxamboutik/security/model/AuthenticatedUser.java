package sn.boutique.xamxamboutik.security.model;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import java.util.Collection;
@Getter
@Builder
public class AuthenticatedUser implements UserDetails, UserAuthInfo {
    private final Long id;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final Utilisateur utilisateur;
    public AuthenticatedUser(Long id, String username, String password,
                             Collection<? extends GrantedAuthority> authorities,
                             Utilisateur utilisateur) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.utilisateur = utilisateur;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    }
}
