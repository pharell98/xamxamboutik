package sn.boutique.xamxamboutik.Web.DTO.Mapper;

import org.springframework.stereotype.Component;
import sn.boutique.xamxamboutik.Web.DTO.Request.ApprovisionnementExcelRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.ProduitRequestDTO;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ApprovisionnementExcelMapperImpl {
    
    public ProduitRequestDTO toProduitRequestDTO(ApprovisionnementExcelRequestDTO excelDTO) {
        if (excelDTO == null) {
            return null;
        }
        
        ProduitRequestDTO produitRequestDTO = new ProduitRequestDTO();
        
        // Mapping des propriétés
        produitRequestDTO.setCodeProduit(excelDTO.getCodeProduit());
        produitRequestDTO.setLibelle(excelDTO.getLibelle());
        produitRequestDTO.setPrixAchat(excelDTO.getPrixAchat());
        produitRequestDTO.setPrixVente(excelDTO.getPrixVente());
        produitRequestDTO.setStockDisponible(excelDTO.getStockDisponible());
        produitRequestDTO.setSeuilRuptureStock(excelDTO.getSeuilRuptureStock());
        produitRequestDTO.setImageURL(excelDTO.getImageURL());
        produitRequestDTO.setCategorieId(excelDTO.getCategorieId());
        produitRequestDTO.setUseImageURL(excelDTO.getUseImageURL());
        produitRequestDTO.setId(excelDTO.getId());
        
        // Mapping spécial pour categorieProduit vers categorieName
        produitRequestDTO.setCategorieName(excelDTO.getCategorieProduit());
        
        // image est ignoré car on utilise imageURL
        produitRequestDTO.setImage(null);
        
        return produitRequestDTO;
    }
    
    public List<ProduitRequestDTO> toProduitRequestDTOs(List<ApprovisionnementExcelRequestDTO> excelDTOs) {
        if (excelDTOs == null) {
            return null;
        }
        
        return excelDTOs.stream()
                .map(this::toProduitRequestDTO)
                .collect(Collectors.toList());
    }
} 