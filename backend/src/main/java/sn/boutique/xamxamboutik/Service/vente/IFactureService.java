package sn.boutique.xamxamboutik.Service.vente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureGenerateRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.FactureSearchRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.MiniRecuResponseDTO;

public interface IFactureService {
    
    /**
     * Génère une facture complète à partir d'une vente
     */
    FactureResponseDTO generateFacture(FactureGenerateRequestDTO request);
    
    /**
     * Génère un mini reçu pour imprimante thermique
     */
    MiniRecuResponseDTO generateMiniRecu(FactureGenerateRequestDTO request);
    
    /**
     * Récupère toutes les ventes avec pagination
     */
    FactureListResponseDTO getAllFactures(Pageable pageable);
    
    /**
     * Récupère une facture par son numéro
     */
    FactureResponseDTO getFactureByNumero(String numeroFacture);
    
    /**
     * Récupère une facture par ID de vente
     */
    FactureResponseDTO getFactureByVenteId(Long venteId);
    
    /**
     * Recherche de factures avec filtres et pagination
     */
    FactureListResponseDTO searchFactures(FactureSearchRequestDTO request);
    
    /**
     * Vérifie si un numéro de facture existe
     */
    boolean existsByNumeroFacture(String numeroFacture);
    
    /**
     * Génère un mini reçu par numéro de facture
     */
    MiniRecuResponseDTO getMiniRecuByNumero(String numeroFacture);
}
