package sn.boutique.xamxamboutik.Web.DTO.Response.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les KPIs complémentaires du dashboard
 * Évite la duplication avec /caisse/etat qui fournit déjà CA, pertes, montants
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpisComplementairesDTO {
    // Panier moyen
    private Double panierMoyen;
    private Long nombreVentes;
    
    // Produits
    private Long produitsVendus;
    
    // Alertes stock (compteurs)
    private Long produitsEnRupture;
    private Long produitsAlerteCritique;
}

