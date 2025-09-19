package sn.boutique.xamxamboutik.Service.produit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.boutique.xamxamboutik.Repository.Projection.ProduitStockProjection;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;

import static java.util.Objects.requireNonNull;

@Service
public class ProduitStockService {

    private static final Logger logger = LoggerFactory.getLogger(ProduitStockService.class);
    private final ProduitRepository produitRepository;

    @Autowired
    public ProduitStockService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    /**
     * Récupère les produits en rupture de stock
     * Un produit est considéré en rupture si :
     * - Il n'est pas supprimé (deleted = false)
     * ET l'une des conditions suivantes :
     *   1. Son stock disponible = 0 (rupture totale, même sans seuil défini)
     *   2. Il a un seuil défini ET son stock <= seuil (faible stock)
     */
    @Transactional(readOnly = true)
    public Page<ProduitStockProjection> getProduitsEnRupture(Pageable pageable) {
        requireNonNull(pageable, "Les paramètres de pagination ne peuvent pas être nuls");
        
        logger.debug("Recherche des produits en rupture de stock avec pagination: page={}, size={}", 
                    pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ProduitStockProjection> result = produitRepository.findProduitsEnRupture(pageable);
        
        logger.debug("Produits en rupture trouvés: {} sur {} total", 
                    result.getNumberOfElements(), result.getTotalElements());
        
        return result;
    }

    /**
     * Compte le nombre total de produits en rupture de stock
     */
    @Transactional(readOnly = true)
    public long countProduitsEnRupture() {
        // Utiliser une requête de comptage optimisée
        Page<ProduitStockProjection> result = produitRepository.findProduitsEnRupture(Pageable.unpaged());
        long count = result.getTotalElements();
        
        logger.debug("Nombre total de produits en rupture: {}", count);
        return count;
    }
}