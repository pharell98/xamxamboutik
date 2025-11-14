package sn.boutique.xamxamboutik.Service.produit;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;

@Component
public class ProduitNormalizationRunner {
    private static final Logger log = LoggerFactory.getLogger(ProduitNormalizationRunner.class);
    private final ProduitRepository produitRepository;

    public ProduitNormalizationRunner(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    @PostConstruct
    @Transactional
    public void normalizeExistingLibelles() {
        log.info("Normalisation des libellés produits (colonne libelle_normalized)...");
        produitRepository.normalizeLibelleColumn();
    }
}

