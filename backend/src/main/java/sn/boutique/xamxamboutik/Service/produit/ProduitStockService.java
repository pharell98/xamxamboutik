package sn.boutique.xamxamboutik.Service.produit;

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

    private final ProduitRepository produitRepository;

    @Autowired
    public ProduitStockService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProduitStockProjection> getProduitsEnRupture(Pageable pageable) {
        requireNonNull(pageable, "Les paramètres de pagination ne peuvent pas être nuls");
        return produitRepository.findProduitsEnRupture(pageable);
    }
}