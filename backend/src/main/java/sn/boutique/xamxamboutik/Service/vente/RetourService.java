package sn.boutique.xamxamboutik.Service.vente;

import jakarta.transaction.Transactional;
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
import sn.boutique.xamxamboutik.Repository.vente.PaiementRepository;
import sn.boutique.xamxamboutik.Repository.vente.RetourProduitRepository;
import sn.boutique.xamxamboutik.Repository.vente.VenteRepository;
import sn.boutique.xamxamboutik.Web.DTO.Request.AnnulationRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
@Transactional
public class RetourService implements IRetourService {

    private static final Logger logger = LoggerFactory.getLogger(RetourService.class);

    private final RetourProduitRepository retourProduitRepository;
    private final DetailVenteRepository detailVenteRepository;
    private final VenteRepository venteRepository;
    private final ProduitRepository produitRepository;
    private final PaiementRepository paiementRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public RetourService(
            RetourProduitRepository retourProduitRepository,
            DetailVenteRepository detailVenteRepository,
            VenteRepository venteRepository,
            ProduitRepository produitRepository,
            PaiementRepository paiementRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.retourProduitRepository = retourProduitRepository;
        this.detailVenteRepository = detailVenteRepository;
        this.venteRepository = venteRepository;
        this.produitRepository = produitRepository;
        this.paiementRepository = paiementRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public RetourProduit createRemboursement(RemboursementRequestDTO dto) {
        try {
            logger.info("Début de createRemboursement pour detailVenteId: {}, sousType: {}", dto.getDetailVenteId(), dto.getSousType());
            validateRemboursementRequest(dto);
            if (dto.getSousType() == null) {
                logger.error("Sous-type de remboursement manquant pour l'endpoint principal");
                throw new BaseCustomException("Sous-type de remboursement requis", ErrorCodes.INVALID_REQUEST);
            }
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());
            validateSousType(dto.getSousType(), "remboursement");

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement, échange ou annulation a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(dto.getSousType().name());
            retourProduit.setDetailVente(detailVente);

            switch (dto.getSousType()) {
                case REMBOURSEMENT_AVEC_RETOUR_BON_ETAT:
                    handleRemboursementBonEtat(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
                    break;
                case REMBOURSEMENT_DEFECTUEUX:
                    handleRemboursementDefectueux(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
                    break;
                default:
                    throw new BaseCustomException("Sous-type de remboursement non supporté", ErrorCodes.INVALID_REQUEST);
            }

            retourProduitRepository.save(retourProduit);
            logger.info("Remboursement créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "remboursement");
                logger.info("Message STOMP envoyé à /topic/retours pour remboursement, detailVenteId: {}", dto.getDetailVenteId());
            } else {
                logger.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour remboursement, detailVenteId: {}", dto.getDetailVenteId());
            }
            return retourProduit;
        } catch (BaseCustomException e) {
            logger.error("Erreur gérée lors du remboursement pour detailVenteId: {}. Message: {}", dto.getDetailVenteId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erreur inattendue lors du remboursement pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement du remboursement: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createRemboursementBonEtat(RemboursementRequestDTO dto) {
        dto.setSousType(TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT);
        return createRemboursement(dto);
    }

    @Override
    public RetourProduit createRemboursementDefectueux(RemboursementRequestDTO dto) {
        dto.setSousType(TypeRetour.REMBOURSEMENT_DEFECTUEUX);
        return createRemboursement(dto);
    }

    @Override
    public RetourProduit createEchange(EchangeRequestDTO dto) {
        try {
            logger.info("Début de createEchange pour detailVenteId: {}, sousType: {}", dto.getDetailVenteId(), dto.getSousType());
            validateEchangeRequest(dto);
            if (dto.getSousType() == null) {
                logger.error("Sous-type d'échange manquant pour l'endpoint principal");
                throw new BaseCustomException("Sous-type d'échange requis", ErrorCodes.INVALID_REQUEST);
            }
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());
            validateSousType(dto.getSousType(), "echange");

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement, échange ou annulation a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(dto.getSousType().name());
            retourProduit.setDetailVente(detailVente);

            switch (dto.getSousType()) {
                case ECHANGE_DEFECTUEUX:
                    handleEchangeDefectueux(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
                    break;
                case ECHANGE_CHANGEMENT_PREFERENCE:
                    handleEchangeChangementPreference(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
                    break;
                case ECHANGE_AJUSTEMENT_PRIX:
                    handleEchangeAjustementPrix(detailVente, detailVente.getVente(), dto.getProduitRemplacementId(), dto.getQuantiteRetour());
                    break;
                default:
                    throw new BaseCustomException("Sous-type d'échange non supporté", ErrorCodes.INVALID_REQUEST);
            }

            retourProduitRepository.save(retourProduit);
            logger.info("Échange créé avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "echange");
                logger.info("Message STOMP envoyé à /topic/retours pour échange, detailVenteId: {}", dto.getDetailVenteId());
            } else {
                logger.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour échange, detailVenteId: {}", dto.getDetailVenteId());
            }
            return retourProduit;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'échange pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement de l'échange: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createEchangeDefectueux(EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_DEFECTUEUX);
        return createEchange(dto);
    }

    @Override
    public RetourProduit createEchangeChangementPreference(EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE);
        return createEchange(dto);
    }

    @Override
    public RetourProduit createEchangeAjustementPrix(EchangeRequestDTO dto) {
        dto.setSousType(TypeRetour.ECHANGE_AJUSTEMENT_PRIX);
        return createEchange(dto);
    }

    @Override
    public RetourProduit createAnnulation(AnnulationRequestDTO dto) {
        try {
            logger.info("Début de createAnnulation pour detailVenteId: {}, sousType: {}", dto.getDetailVenteId(), dto.getSousType());
            validateAnnulationRequest(dto);
            if (dto.getSousType() == null) {
                logger.error("Sous-type d'annulation manquant pour l'endpoint principal");
                throw new BaseCustomException("Sous-type d'annulation requis", ErrorCodes.INVALID_REQUEST);
            }
            DetailVente detailVente = validateDetailVente(dto.getDetailVenteId());
            validateSousType(dto.getSousType(), "annulation");

            if (retourProduitRepository.existsByDetailVenteId(dto.getDetailVenteId())) {
                logger.error("Un retour existe déjà pour detailVenteId: {}", dto.getDetailVenteId());
                throw new BaseCustomException(
                        "Un remboursement, échange ou annulation a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(dto.getSousType().name());
            retourProduit.setDetailVente(detailVente);

            switch (dto.getSousType()) {
                case ANNULATION_APRES_LIVRAISON:
                    handleAnnulationApresLivraison(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
                    break;
                case ANNULATION_PARTIELLE:
                    handleAnnulationPartielle(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
                    break;
                case ANNULATION_NON_CONFORMITE:
                    handleAnnulationNonConformite(detailVente, detailVente.getVente(), dto.getQuantiteRetour());
                    break;
                default:
                    throw new BaseCustomException("Sous-type d'annulation non supporté", ErrorCodes.INVALID_REQUEST);
            }

            retourProduitRepository.save(retourProduit);
            logger.info("Annulation créée avec succès pour detailVenteId: {}", dto.getDetailVenteId());
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/retours", "annulation");
                logger.info("Message STOMP envoyé à /topic/retours pour annulation, detailVenteId: {}", dto.getDetailVenteId());
            } else {
                logger.warn("SimpMessagingTemplate non disponible, message STOMP non envoyé pour annulation, detailVenteId: {}", dto.getDetailVenteId());
            }
            return retourProduit;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'annulation pour detailVenteId: {}. Détails: {}", dto.getDetailVenteId(), e.getMessage(), e);
            throw new BaseCustomException(
                    "Erreur interne lors du traitement de l'annulation: " + e.getMessage(),
                    ErrorCodes.INTERNAL_ERROR
            );
        }
    }

    @Override
    public RetourProduit createAnnulationApresLivraison(AnnulationRequestDTO dto) {
        dto.setSousType(TypeRetour.ANNULATION_APRES_LIVRAISON);
        return createAnnulation(dto);
    }

    @Override
    public RetourProduit createAnnulationPartielle(AnnulationRequestDTO dto) {
        dto.setSousType(TypeRetour.ANNULATION_PARTIELLE);
        return createAnnulation(dto);
    }

    @Override
    public RetourProduit createAnnulationNonConformite(AnnulationRequestDTO dto) {
        dto.setSousType(TypeRetour.ANNULATION_NON_CONFORMITE);
        return createAnnulation(dto);
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
        // Vérification supplémentaire : s'assurer que le DetailVente appartient à la Vente
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
        if (dto.getDetailVenteId() == null) {
            logger.error("ID du détail de vente manquant");
            throw new BaseCustomException("ID du détail de vente requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getMotif() == null || dto.getMotif().trim().isEmpty()) {
            logger.error("Motif de remboursement manquant");
            throw new BaseCustomException("Motif de remboursement requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getQuantiteRetour() <= 0) {
            logger.error("Quantité de retour invalide: {}", dto.getQuantiteRetour());
            throw new BaseCustomException("Quantité de retour invalide", ErrorCodes.INVALID_REQUEST);
        }
    }

    private void validateEchangeRequest(EchangeRequestDTO dto) {
        logger.debug("Validation de EchangeRequestDTO: {}", dto);
        if (dto.getDetailVenteId() == null) {
            throw new BaseCustomException("ID du détail de vente requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getMotif() == null || dto.getMotif().trim().isEmpty()) {
            throw new BaseCustomException("Motif d'échange requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getQuantiteRetour() <= 0) {
            throw new BaseCustomException("Quantité de retour invalide", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getProduitRemplacementId() == null) {
            throw new BaseCustomException("ID du produit de remplacement requis pour un échange", ErrorCodes.INVALID_REQUEST);
        }
    }

    private void validateAnnulationRequest(AnnulationRequestDTO dto) {
        logger.debug("Validation de AnnulationRequestDTO: {}", dto);
        if (dto.getDetailVenteId() == null) {
            throw new BaseCustomException("ID du détail de vente requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getMotif() == null || dto.getMotif().trim().isEmpty()) {
            throw new BaseCustomException("Motif d'annulation requis", ErrorCodes.INVALID_REQUEST);
        }
        if (dto.getQuantiteRetour() <= 0) {
            throw new BaseCustomException("Quantité de retour invalide", ErrorCodes.INVALID_REQUEST);
        }
    }

    private void validateSousType(TypeRetour sousType, String operationType) {
        boolean isValid = false;
        switch (operationType.toLowerCase()) {
            case "remboursement":
                isValid = sousType == TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT ||
                        sousType == TypeRetour.REMBOURSEMENT_DEFECTUEUX;
                break;
            case "echange":
                isValid = sousType == TypeRetour.ECHANGE_DEFECTUEUX ||
                        sousType == TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE ||
                        sousType == TypeRetour.ECHANGE_AJUSTEMENT_PRIX;
                break;
            case "annulation":
                isValid = sousType == TypeRetour.ANNULATION_APRES_LIVRAISON ||
                        sousType == TypeRetour.ANNULATION_PARTIELLE ||
                        sousType == TypeRetour.ANNULATION_NON_CONFORMITE;
                break;
        }
        if (!isValid) {
            throw new BaseCustomException(
                    "Sous-type invalide pour l'opération " + operationType,
                    ErrorCodes.INVALID_REQUEST
            );
        }
    }

    private void handleRemboursementBonEtat(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement bon état pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_REMBOURSE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        Produit produit = detailVente.getProduit();
        produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
        produitRepository.save(produit);
        Paiement remboursement = new Paiement();
        remboursement.setDatePaiement(LocalDateTime.now());
        remboursement.setMontantVerser(-montantRembourse);
        remboursement.setModePaiement(vente.getPaiement().getModePaiement());
        remboursement.setVente(vente);
        detailVenteRepository.save(detailVente);
        paiementRepository.save(remboursement);
        updateVenteMontants(vente, -montantRembourse);
    }

    private void handleRemboursementDefectueux(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement défectueux pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_REMBOURSE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        detailVenteRepository.save(detailVente);
        Paiement remboursement = new Paiement();
        remboursement.setDatePaiement(LocalDateTime.now());
        remboursement.setMontantVerser(-montantRembourse);
        remboursement.setModePaiement(vente.getPaiement().getModePaiement());
        remboursement.setVente(vente);
        paiementRepository.save(remboursement);
        updateVenteMontants(vente, -montantRembourse);
    }

    private void handleEchangeDefectueux(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange défectueux pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        Produit produitRemplacement = produitRepository.findById(produitRemplacementId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Produit de remplacement introuvable (ID: " + produitRemplacementId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND));
        if (produitRemplacement.getStockDisponible() < quantiteRetour) {
            throw new BaseCustomException(
                    "Stock insuffisant pour le produit de remplacement : " + produitRemplacement.getLibelle(),
                    ErrorCodes.INSUFFICIENT_STOCK
            );
        }
        double montantRetourne = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_ECHANGE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        DetailVente nouveauDetailVente = new DetailVente();
        nouveauDetailVente.setVente(vente);
        nouveauDetailVente.setProduit(produitRemplacement);
        nouveauDetailVente.setPrixVente(detailVente.getPrixVente());
        nouveauDetailVente.setQuantiteVendu(quantiteRetour);
        nouveauDetailVente.setMontantTotal(nouveauDetailVente.getPrixVente() * quantiteRetour);
        nouveauDetailVente.setStatus(StatusDetailVente.VENDU);
        detailVenteRepository.save(detailVente);
        detailVenteRepository.save(nouveauDetailVente);
        produitRemplacement.setStockDisponible(produitRemplacement.getStockDisponible() - quantiteRetour);
        produitRepository.save(produitRemplacement);
        vente.getDetailVentes().add(nouveauDetailVente);
        double montantAjoute = nouveauDetailVente.getMontantTotal();
        updateVenteMontants(vente, montantAjoute - montantRetourne);
    }

    private void handleEchangeChangementPreference(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange changement de préférence pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        Produit produitRetourne = detailVente.getProduit();
        produitRetourne.setStockDisponible(produitRetourne.getStockDisponible() + quantiteRetour);
        produitRepository.save(produitRetourne);
        Produit produitRemplacement = produitRepository.findById(produitRemplacementId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Produit de remplacement introuvable (ID: " + produitRemplacementId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND));
        if (produitRemplacement.getStockDisponible() < quantiteRetour) {
            throw new BaseCustomException(
                    "Stock insuffisant pour le produit de remplacement : " + produitRemplacement.getLibelle(),
                    ErrorCodes.INSUFFICIENT_STOCK
            );
        }
        double montantRetourne = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_ECHANGE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        DetailVente nouveauDetailVente = new DetailVente();
        nouveauDetailVente.setVente(vente);
        nouveauDetailVente.setProduit(produitRemplacement);
        nouveauDetailVente.setPrixVente(detailVente.getPrixVente());
        nouveauDetailVente.setQuantiteVendu(quantiteRetour);
        nouveauDetailVente.setMontantTotal(nouveauDetailVente.getPrixVente() * quantiteRetour);
        nouveauDetailVente.setStatus(StatusDetailVente.VENDU);
        detailVenteRepository.save(detailVente);
        detailVenteRepository.save(nouveauDetailVente);
        produitRemplacement.setStockDisponible(produitRemplacement.getStockDisponible() - quantiteRetour);
        produitRepository.save(produitRemplacement);
        vente.getDetailVentes().add(nouveauDetailVente);
        double montantAjoute = nouveauDetailVente.getMontantTotal();
        updateVenteMontants(vente, montantAjoute - montantRetourne);
    }

    private void handleEchangeAjustementPrix(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange avec ajustement de prix pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à retourner supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        Produit produitRetourne = detailVente.getProduit();
        produitRetourne.setStockDisponible(produitRetourne.getStockDisponible() + quantiteRetour);
        produitRepository.save(produitRetourne);
        Produit produitRemplacement = produitRepository.findById(produitRemplacementId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Produit de remplacement introuvable (ID: " + produitRemplacementId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND));
        if (produitRemplacement.getStockDisponible() < quantiteRetour) {
            throw new BaseCustomException(
                    "Stock insuffisant pour le produit de remplacement : " + produitRemplacement.getLibelle(),
                    ErrorCodes.INSUFFICIENT_STOCK
            );
        }
        double montantRetourne = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.RETOURNE_ECHANGE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        DetailVente nouveauDetailVente = new DetailVente();
        nouveauDetailVente.setVente(vente);
        nouveauDetailVente.setProduit(produitRemplacement);
        nouveauDetailVente.setPrixVente(produitRemplacement.getPrixVente());
        nouveauDetailVente.setQuantiteVendu(quantiteRetour);
        nouveauDetailVente.setMontantTotal(nouveauDetailVente.getPrixVente() * quantiteRetour);
        nouveauDetailVente.setStatus(StatusDetailVente.VENDU);
        detailVenteRepository.save(detailVente);
        detailVenteRepository.save(nouveauDetailVente);
        produitRemplacement.setStockDisponible(produitRemplacement.getStockDisponible() - quantiteRetour);
        produitRepository.save(produitRemplacement);
        double montantAjoute = nouveauDetailVente.getMontantTotal();
        double montantAjuste = montantAjoute - montantRetourne;
        if (montantAjuste != 0) {
            Paiement ajustement = new Paiement();
            ajustement.setDatePaiement(LocalDateTime.now());
            ajustement.setMontantVerser(montantAjuste);
            ajustement.setModePaiement(vente.getPaiement().getModePaiement());
            ajustement.setVente(vente);
            paiementRepository.save(ajustement);
        }
        vente.getDetailVentes().add(nouveauDetailVente);
        updateVenteMontants(vente, montantAjuste);
    }

    private void handleAnnulationApresLivraison(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement de l'annulation après livraison pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à annuler supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.ANNULE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        Produit produit = detailVente.getProduit();
        produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
        produitRepository.save(produit);
        Paiement remboursement = new Paiement();
        remboursement.setDatePaiement(LocalDateTime.now());
        remboursement.setMontantVerser(-montantRembourse);
        remboursement.setModePaiement(vente.getPaiement().getModePaiement());
        remboursement.setVente(vente);
        detailVenteRepository.save(detailVente);
        paiementRepository.save(remboursement);
        updateVenteMontants(vente, -montantRembourse);
    }

    private void handleAnnulationPartielle(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement de l'annulation partielle pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à annuler supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
        detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        Produit produit = detailVente.getProduit();
        produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
        produitRepository.save(produit);
        Paiement remboursement = new Paiement();
        remboursement.setDatePaiement(LocalDateTime.now());
        remboursement.setMontantVerser(-montantRembourse);
        remboursement.setModePaiement(vente.getPaiement().getModePaiement());
        remboursement.setVente(vente);
        detailVenteRepository.save(detailVente);
        paiementRepository.save(remboursement);
        updateVenteMontants(vente, -montantRembourse);
    }

    private void handleAnnulationNonConformite(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement de l'annulation pour non-conformité pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        if (quantiteRetour > detailVente.getQuantiteVendu()) {
            throw new BaseCustomException(
                    "Quantité à annuler supérieure à la quantité vendue",
                    ErrorCodes.INVALID_REQUEST
            );
        }
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            detailVente.setStatus(StatusDetailVente.ANNULE);
            detailVente.setMontantTotal(0.0);
        } else {
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
        Produit produit = detailVente.getProduit();
        produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
        produitRepository.save(produit);
        Paiement remboursement = new Paiement();
        remboursement.setDatePaiement(LocalDateTime.now());
        remboursement.setMontantVerser(-montantRembourse);
        remboursement.setModePaiement(vente.getPaiement().getModePaiement());
        remboursement.setVente(vente);
        detailVenteRepository.save(detailVente);
        paiementRepository.save(remboursement);
        updateVenteMontants(vente, -montantRembourse);
    }

    private void updateVenteMontants(Vente vente, double montantModifie) {
        logger.debug("Mise à jour des montants pour Vente ID: {}, Montant modifié: {}", vente.getId(), montantModifie);
        double nouveauMontantTotal = vente.getMontantTotal() + montantModifie;
        vente.setMontantTotal(nouveauMontantTotal);
        if (vente.getEstCredit()) {
            double montantPaye = vente.getPaiement() != null ? vente.getPaiement().getMontantVerser() : 0.0;
            vente.setMontantRestant(nouveauMontantTotal - montantPaye);
        } else {
            vente.setMontantRestant(0.0);
        }
        venteRepository.save(vente);
    }
}