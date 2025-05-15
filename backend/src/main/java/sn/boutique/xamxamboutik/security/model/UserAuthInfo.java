package sn.boutique.xamxamboutik.security.model;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;
public interface UserAuthInfo {
    Long getId();
    String getUsername();
    Collection<? extends GrantedAuthority> getAuthorities();
}
