package sn.boutique.xamxamboutik.Service.approvisionnement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import sn.boutique.xamxamboutik.Entity.approvisionnement.Approvisionnement;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Repository.Projection.ApprovisionnementProjection;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.ApprovisionnementProductDTO;

public interface IApprovisionnementService {

    /* classique */
    Approvisionnement createApprovisionnement(ApprovisionnementRequestDTO dto, MultipartFile[] newProduitImages);

    /* lecture */
    Page<ApprovisionnementProjection> getAllApprovisionnements(Pageable pageable);
    Page<ApprovisionnementProductDTO> getProductsByApprovisionnement(Long approId, Pageable pageable);

    /* virtuel */
    Approvisionnement createApprovisionnementVirtuel(Produit produit, int quantite, Double prixAchat);

    /* excel */
    Approvisionnement createApprovisionnementExcelBatch(String codeAppro);
    void addExcelDetail(Approvisionnement approvisionnement, Produit produit, int quantite, Double prixAchat);
    void finalizeAndSaveApprovisionnement(Approvisionnement approvisionnement);
    String generateExcelApproCode();
}
