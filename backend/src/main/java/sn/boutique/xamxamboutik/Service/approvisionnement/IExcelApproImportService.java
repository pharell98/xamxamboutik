package sn.boutique.xamxamboutik.Service.approvisionnement;

import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;

import java.util.List;
import java.util.Map;

public interface IExcelApproImportService {
    /**
     * Importe les produits d’un fichier Excel ; l’opération est
     * transactionnelle : si une ligne est invalide, rien n’est enregistré.
     *
     * @return Map contenant : approvisionnement, produitsEnregistres, erreurs
     */
    Map<String, Object> importProduitsExcel(List<ProduitRequestDTO> produitsExcel) throws Exception;
}
