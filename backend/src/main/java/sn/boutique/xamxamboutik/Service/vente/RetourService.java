package sn.boutique.xamxamboutik.Service.vente;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sn.boutique.xamxamboutik.Entity.produit.Produit;
import sn.boutique.xamxamboutik.Entity.vente.DetailVente;
import sn.boutique.xamxamboutik.Entity.vente.Paiement;
import sn.boutique.xamxamboutik.Entity.vente.RetourProduit;
import sn.boutique.xamxamboutik.Entity.vente.Vente;
import sn.boutique.xamxamboutik.Enums.StatusDetailVente;
import sn.boutique.xamxamboutik.Enums.TypeRetour;
import sn.boutique.xamxamboutik.Exception.BaseCustomException;
import sn.boutique.xamxamboutik.Exception.EntityNotFoundException;
import sn.boutique.xamxamboutik.Exception.ErrorCodes;
import sn.boutique.xamxamboutik.Repository.produit.ProduitRepository;
import sn.boutique.xamxamboutik.Repository.vente.DetailVenteRepository;
import sn.boutique.xamxamboutik.Repository.vente.RetourProduitRepository;
import sn.boutique.xamxamboutik.Repository.vente.VenteRepository;
import sn.boutique.xamxamboutik.Service.user.CurrentUserService;
import sn.boutique.xamxamboutik.Service.statistique.CaisseInternalService;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Transactional
public class RetourService implements IRetourService {

    private static final Logger logger = LoggerFactory.getLogger(RetourService.class);

    private final RetourProduitRepository retourProduitRepository;
    private final DetailVenteRepository detailVenteRepository;
    private final VenteRepository venteRepository;
    private final ProduitRepository produitRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CurrentUserService currentUserService;
    private final CaisseInternalService caisseInternalService;

    @Autowired
    public RetourService(
            RetourProduitRepository retourProduitRepository,
            DetailVenteRepository detailVenteRepository,
            VenteRepository venteRepository,
            ProduitRepository produitRepository,
            SimpMessagingTemplate messagingTemplate,
            CurrentUserService currentUserService,
            CaisseInternalService caisseInternalService
    ) {
        this.retourProduitRepository = retourProduitRepository;
        this.detailVenteRepository = detailVenteRepository;
        this.venteRepository = venteRepository;
        this.produitRepository = produitRepository;
        this.messagingTemplate = messagingTemplate;
        this.currentUserService = currentUserService;
        this.caisseInternalService = caisseInternalService;
    }

    @Override
    public RetourProduit createRemboursementBonEtat(RemboursementRequestDTO dto) {
        try {
            logger.info("Début de createRemboursementBonEtat pour detailVenteId: {}", dto.getDetailVenteId());
            validateRemboursementRequest(dto);
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT.name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

            double montantRemboursementBonEtat = handleRemboursementBonEtat(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
            caisseInternalService.updateVentesJournalieresRealtime();
            logger.info("Remboursement bon état: {} FCFA retourné au client, caisse mise à jour", montantRemboursementBonEtat);

            retourProduitRepository.save(retourProduit);
            logger.info("Remboursement (bon état) créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "remboursement");
            }
            return retourProduit;
        } catch (BaseCustomException e) {
            logger.error("Erreur gérée lors du remboursement bon état pour detailVenteId: {}. Message: {}", dto.getDetailVenteId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erreur inattendue lors du remboursement bon état pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement du remboursement: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createRemboursementDefectueux(RemboursementRequestDTO dto) {
        try {
            logger.info("Début de createRemboursementDefectueux pour detailVenteId: {}", dto.getDetailVenteId());
            validateRemboursementRequest(dto);
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(TypeRetour.REMBOURSEMENT_DEFECTUEUX.name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

            double perte = handleRemboursementDefectueux(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
            caisseInternalService.updateVentesJournalieresRealtime();
            caisseInternalService.updatePertesJournalieres(LocalDate.now(), perte);
            logger.info("Remboursement défectueux: {} FCFA retourné au client, perte enregistrée, caisse mise à jour", perte);

            retourProduitRepository.save(retourProduit);
            logger.info("Remboursement (défectueux) créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "remboursement");
            }
            return retourProduit;
        } catch (BaseCustomException e) {
            logger.error("Erreur gérée lors du remboursement défectueux pour detailVenteId: {}. Message: {}", dto.getDetailVenteId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erreur inattendue lors du remboursement défectueux pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement du remboursement: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createEchangeDefectueux(EchangeRequestDTO dto) {
        try {
            logger.info("Début de createEchangeDefectueux pour detailVenteId: {}", dto.getDetailVenteId());
            validateEchangeRequest(dto);
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(TypeRetour.ECHANGE_DEFECTUEUX.name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

            double perte = handleEchangeDefectueux(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
            caisseInternalService.updateVentesJournalieresRealtime();
            caisseInternalService.updatePertesJournalieres(LocalDate.now(), perte);
            logger.info("Échange défectueux: {} FCFA de perte, caisse mise à jour", perte);

            retourProduitRepository.save(retourProduit);
            logger.info("Échange défectueux créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "echange");
            }
            return retourProduit;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'échange défectueux pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement de l'échange: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createEchangeChangementPreference(EchangeRequestDTO dto) {
        try {
            logger.info("Début de createEchangeChangementPreference pour detailVenteId: {}", dto.getDetailVenteId());
            validateEchangeRequest(dto);
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE.name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

            handleEchangeChangementPreference(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
            caisseInternalService.updateVentesJournalieresRealtime();
            logger.info("Échange changement préférence: caisse mise à jour");

            retourProduitRepository.save(retourProduit);
            logger.info("Échange (changement préférence) créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "echange");
            }
            return retourProduit;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'échange changement de préférence pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement de l'échange: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createEchangeAjustementPrix(EchangeRequestDTO dto) {
        try {
            logger.info("Début de createEchangeAjustementPrix pour detailVenteId: {}", dto.getDetailVenteId());
            validateEchangeRequest(dto);
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(TypeRetour.ECHANGE_AJUSTEMENT_PRIX.name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

            handleEchangeAjustementPrix(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
            caisseInternalService.updateVentesJournalieresRealtime();
            logger.info("Échange ajustement prix: caisse mise à jour");

            retourProduitRepository.save(retourProduit);
            logger.info("Échange (ajustement prix) créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "echange");
            }
            return retourProduit;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'échange ajustement prix pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement de l'échange: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    private DetailVente validateDetailVente(Long detailVenteId) {
        logger.debug("Validation de DetailVente pour ID: {}", detailVenteId);
        DetailVente detailVente = detailVenteRepository.findById(detailVenteId)
                .orElseThrow(() -> {
                    logger.error("DetailVente introuvable pour ID: {}", detailVenteId);
                    return new EntityNotFoundException(
                            "Détail de vente introuvable (ID: " + detailVenteId + ")",
                            ErrorCodes.ENTITY_NOT_FOUND);
                });
        if (detailVente.getStatus() != StatusDetailVente.VENDU) {
            logger.error("Statut invalide pour DetailVente ID: {}. Statut actuel: {}", detailVenteId, detailVente.getStatus());
            throw new BaseCustomException(
                    "Le produit a déjà été retourné, échangé ou annulé",
                    ErrorCodes.INVALID_STATE
            );
        }
        Vente vente = detailVente.getVente();
        if (vente == null) {
            logger.error("Vente introuvable pour DetailVente ID: {}", detailVenteId);
            throw new EntityNotFoundException(
                    "Vente introuvable pour le détail de vente (ID: " + detailVenteId + ")",
                    ErrorCodes.ENTITY_NOT_FOUND);
        }
        if (!vente.getDetailVentes().contains(detailVente)) {
            logger.error("DetailVente ID: {} n'appartient pas à la vente associée", detailVenteId);
            throw new BaseCustomException(
                    "Le détail de vente n'appartient pas à la vente spécifiée",
                    ErrorCodes.INVALID_STATE
            );
        }
        return detailVente;
    }

    private void validateRemboursementRequest(RemboursementRequestDTO dto) {
        logger.debug("Validation de RemboursementRequestDTO: {}", dto);
        validateCommonRetourFields(dto.getDetailVenteId(), dto.getMotif(), dto.getQuantiteRetour());
    }

    private void validateEchangeRequest(EchangeRequestDTO dto) {
        logger.debug("Validation de EchangeRequestDTO: {}", dto);
        validateCommonRetourFields(dto.getDetailVenteId(), dto.getMotif(), dto.getQuantiteRetour());
        if (dto.getProduitRemplacementId() == null) {
            throw new BaseCustomException("ID du produit de remplacement requis pour un échange", ErrorCodes.INVALID_REQUEST);
        }
    }
    
    private void validateCommonRetourFields(Long detailVenteId, String motif, int quantiteRetour) {
        if (detailVenteId == null) {
            throw new BaseCustomException("ID du détail de vente requis", ErrorCodes.INVALID_REQUEST);
        }
        if (motif == null || motif.trim().isEmpty()) {
            throw new BaseCustomException("Motif requis", ErrorCodes.INVALID_REQUEST);
        }
        if (quantiteRetour <= 0) {
            throw new BaseCustomException("Quantité de retour invalide", ErrorCodes.INVALID_REQUEST);
        }
    }

    private double handleRemboursementBonEtat(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement bon état pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        double montantRembourse = processRemboursement(detailVente, vente, quantiteRetour, true);
        logger.info("Remboursement bon état traité: montant={}, stock remis", montantRembourse);
        return montantRembourse;
    }

    private double handleRemboursementDefectueux(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement défectueux pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        double montantRembourse = processRemboursement(detailVente, vente, quantiteRetour, false);
        logger.info("Remboursement défectueux traité: montant={}, stock non remis", montantRembourse);
        return montantRembourse;
    }
    
    /**
     * Méthode commune pour traiter les remboursements
     */
    private double processRemboursement(DetailVente detailVente, Vente vente, int quantiteRetour, boolean remettreEnStock) {
        validateQuantiteRetour(detailVente, quantiteRetour);
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        updateDetailVenteForRemboursement(detailVente, quantiteRetour);
        if (remettreEnStock) {
            Produit produit = detailVente.getProduit();
            produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
            produitRepository.save(produit);
        }
        detailVenteRepository.save(detailVente);
        updateVenteMontants(vente, 0);
        return montantRembourse;
    }
    
    private void validateQuantiteRetour(DetailVente detailVente, int quantiteRetour) {
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner (" + quantiteRetour + ") supérieure à la quantité vendue (" + detailVente.getQuantiteVendu() + ")",
                    ErrorCodes.INVALID_REQUEST
            );
        }
    }
    
    private void updateDetailVenteForRemboursement(DetailVente detailVente, int quantiteRetour) {
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_REMBOURSE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
    }
    
    private double handleEchangeDefectueux(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange défectueux pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        double perte = detailVente.getPrixVente() * quantiteRetour;
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, false, false);
        logger.info("Échange défectueux traité: ancien produit non remis en stock, perte: {} FCFA", perte);
        return perte;
    }

    private void handleEchangeChangementPreference(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange changement de préférence pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, true, false);
        logger.info("Échange changement préférence traité: ancien produit remis en stock");
    }

    private void handleEchangeAjustementPrix(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange avec ajustement de prix pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, true, true);
        logger.info("Échange ajustement prix traité: ancien produit remis en stock, nouveau prix appliqué");
    }
    
    /**
     * Méthode commune pour traiter tous les types d'échange
     */
    private void processEchange(DetailVente detailVente, Vente vente, Long produitRemplacementId, 
                               int quantiteRetour, boolean remettreAncienEnStock, boolean nouveauPrix) {
        validateQuantiteRetour(detailVente, quantiteRetour);
        Produit produitRemplacement = produitRepository.findById(produitRemplacementId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Produit de remplacement introuvable (ID: " + produitRemplacementId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND));
        if (produitRemplacement.getStockDisponible() < quantiteRetour) {
            throw new BaseCustomException(
                    "Stock insuffisant pour le produit de remplacement : " + produitRemplacement.getLibelle() +
                    " (Disponible: " + produitRemplacement.getStockDisponible() + ", Demandé: " + quantiteRetour + ")",
                    ErrorCodes.INSUFFICIENT_STOCK
            );
        }
        if (remettreAncienEnStock) {
            Produit ancienProduit = detailVente.getProduit();
            ancienProduit.setStockDisponible(ancienProduit.getStockDisponible() + quantiteRetour);
            produitRepository.save(ancienProduit);
        }
        double montantRetourne = detailVente.getPrixVente() * quantiteRetour;
        updateDetailVenteForEchange(detailVente, quantiteRetour);
        DetailVente nouveauDetailVente = createNewDetailVente(vente, produitRemplacement, detailVente, quantiteRetour, nouveauPrix);
        produitRemplacement.setStockDisponible(produitRemplacement.getStockDisponible() - quantiteRetour);
        produitRepository.save(produitRemplacement);
        detailVenteRepository.save(detailVente);
        detailVenteRepository.save(nouveauDetailVente);
        vente.getDetailVentes().add(nouveauDetailVente);
        if (nouveauPrix) {
            double montantAjoute = nouveauDetailVente.getMontantTotal();
            double montantAjuste = montantAjoute - montantRetourne;
            logger.debug("Ajustement de prix calculé: {} (nouveau: {}, ancien: {})", montantAjuste, montantAjoute, montantRetourne);
        }
        updateVenteMontants(vente, 0);
    }
    
    private void updateDetailVenteForEchange(DetailVente detailVente, int quantiteRetour) {
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_ECHANGE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
    }
    
    private DetailVente createNewDetailVente(Vente vente, Produit produitRemplacement, 
                                           DetailVente ancienDetailVente, int quantiteRetour, boolean nouveauPrix) {
        DetailVente nouveauDetailVente = new DetailVente();
        nouveauDetailVente.setVente(vente);
        nouveauDetailVente.setProduit(produitRemplacement);
        Double prixAUtiliser = nouveauPrix ? produitRemplacement.getPrixVente() : ancienDetailVente.getPrixVente();
        nouveauDetailVente.setPrixVente(prixAUtiliser);
        nouveauDetailVente.setQuantiteVendu(quantiteRetour);
        nouveauDetailVente.setMontantTotal(prixAUtiliser * quantiteRetour);
        nouveauDetailVente.setStatus(StatusDetailVente.VENDU);
        return nouveauDetailVente;
    }
    
    /**
     * Recalcul des montants de la vente après retour/échange
     */
    private void updateVenteMontants(Vente vente, double montantModifie) {
        logger.debug("Mise à jour des montants pour Vente ID: {}, Montant modifié: {}", vente.getId(), montantModifie);
        double nouveauMontantTotal = vente.getDetailVentes().stream()
                .mapToDouble(DetailVente::getMontantTotal)
                .sum();
        logger.debug("Ancien montant total: {}, Nouveau montant total calculé: {}", vente.getMontantTotal(), nouveauMontantTotal);
        vente.setMontantTotal(nouveauMontantTotal);
        if (vente.getEstCredit()) {
            double montantTotalPaye = calculerMontantTotalPaye(vente);
            vente.setMontantRestant(Math.max(0.0, nouveauMontantTotal - montantTotalPaye));
            logger.debug("Vente à crédit - Montant payé: {}, Montant restant: {}", montantTotalPaye, vente.getMontantRestant());
        } else {
            vente.setMontantRestant(0.0);
        }
        venteRepository.save(vente);
    }

    private double calculerMontantTotalPaye(Vente vente) {
        return vente.getPaiements().stream()
                .filter(p -> p.getMontantVerser() > 0)
                .mapToDouble(Paiement::getMontantVerser)
                .sum();
    }
}