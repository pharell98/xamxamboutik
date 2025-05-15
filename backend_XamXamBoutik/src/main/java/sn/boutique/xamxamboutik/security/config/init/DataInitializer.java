package sn.boutique.xamxamboutik.security.config.init;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Entity.utilisateur.Utilisateur;
import sn.boutique.xamxamboutik.Enums.Role;
import sn.boutique.xamxamboutik.Repository.utilisateur.UtilisateurRepository;
import java.time.LocalDateTime;
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() == 0) {
            initUsers();
        }
    }
    private void initUsers() {
        Utilisateur gestionnaire = new Utilisateur();
        gestionnaire.setNom("Admin Gestionnaire");
        gestionnaire.setLogin("admin");
        gestionnaire.setPassword(passwordEncoder.encode("admin123"));
        gestionnaire.setRole(Role.GESTIONNAIRE);
        gestionnaire.setCreatedAt(LocalDateTime.now());
        gestionnaire.setUpdatedAt(LocalDateTime.now());
        gestionnaire.setCreatedBy("system");
        gestionnaire.setUpdatedBy("system");
        gestionnaire.setDeleted(false);
        Utilisateur vendeur = new Utilisateur();
        vendeur.setNom("Vendeur Test");
        vendeur.setLogin("vendeur");
        vendeur.setPassword(passwordEncoder.encode("vendeur123"));
        vendeur.setRole(Role.VENDEUR);
        vendeur.setCreatedAt(LocalDateTime.now());
        vendeur.setUpdatedAt(LocalDateTime.now());
        vendeur.setCreatedBy("system");
        vendeur.setUpdatedBy("system");
        vendeur.setDeleted(false);
        try {
            utilisateurRepository.save(gestionnaire);
            utilisateurRepository.save(vendeur);
        } catch (Exception e) {
        }
    }
}