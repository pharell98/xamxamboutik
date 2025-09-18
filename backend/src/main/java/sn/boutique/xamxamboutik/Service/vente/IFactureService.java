package sn.boutique.xamxamboutik.Service.vente;

import org.springframework.data.domain.Pageable;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureListResponseDTO;
import sn.boutique.xamxamboutik.Web.DTO.Response.web.FactureResponseDTO;

import java.time.LocalDate;

public interface IFactureService {


    /**
     * Récupère toutes les ventes avec pagination
     */
    FactureListResponseDTO getAllFactures(Pageable pageable);

    /**
     * Récupère une facture par son numéro
     */
    FactureResponseDTO getFactureByNumero(String numeroFacture);


    /**
     * Vérifie si un numéro de facture existe
     */
    boolean existsByNumeroFacture(String numeroFacture);

    /**
     * Récupère toutes les factures du jour en cours
     */
    FactureListResponseDTO getFacturesDuJour(Pageable pageable);

    /**
     * Récupère toutes les factures d'une date donnée
     */
    FactureListResponseDTO getFacturesParDate(LocalDate date, Pageable pageable);

    /**
     * Récupère toutes les factures du mois en cours
     */
    FactureListResponseDTO getFacturesDuMois(Pageable pageable);

    /**
     * Récupère une facture par son numéro en excluant les produits défectueux
     */
    FactureResponseDTO getFactureByNumeroExcludingDefective(String numeroFacture);

}
