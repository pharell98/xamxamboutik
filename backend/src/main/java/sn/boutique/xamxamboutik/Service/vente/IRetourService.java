package sn.boutique.xamxamboutik.Service.vente;

import sn.boutique.xamxamboutik.Entity.vente.RetourProduit;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;

public interface IRetourService {

    RetourProduit createRemboursementBonEtat(RemboursementRequestDTO dto);

    RetourProduit createRemboursementDefectueux(RemboursementRequestDTO dto);

    RetourProduit createEchangeDefectueux(EchangeRequestDTO dto);

    RetourProduit createEchangeChangementPreference(EchangeRequestDTO dto);

    RetourProduit createEchangeAjustementPrix(EchangeRequestDTO dto);
}