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
import sn.boutique.xamxamboutik.Repository.vente.PaiementRepository;
import sn.boutique.xamxamboutik.Repository.vente.RetourProduitRepository;
import sn.boutique.xamxamboutik.Repository.vente.VenteRepository;
import sn.boutique.xamxamboutik.Service.user.CurrentUserService;
import sn.boutique.xamxamboutik.Web.DTO.Request.EchangeRequestDTO;
import sn.boutique.xamxamboutik.Web.DTO.Request.RemboursementRequestDTO;

import java.time.LocalDateTime;
import java.util.List;

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
    private final CurrentUserService currentUserService;

    @Autowired
    public RetourService(
            RetourProduitRepository retourProduitRepository,
            DetailVenteRepository detailVenteRepository,
            VenteRepository venteRepository,
            ProduitRepository produitRepository,
            PaiementRepository paiementRepository,
            SimpMessagingTemplate messagingTemplate,
            CurrentUserService currentUserService
    ) {
        this.retourProduitRepository = retourProduitRepository;
        this.detailVenteRepository = detailVenteRepository;
        this.venteRepository = venteRepository;
        this.produitRepository = produitRepository;
        this.paiementRepository = paiementRepository;
        this.messagingTemplate = messagingTemplate;
        this.currentUserService = currentUserService;
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
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(dto.getSousType().name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

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
                        "Un remboursement ou échange a déjà été effectué pour cette vente",
                        ErrorCodes.INVALID_STATE
                );
            }

            RetourProduit retourProduit = new RetourProduit();
            retourProduit.setDateRetour(LocalDateTime.now());
            retourProduit.setMotif(dto.getMotif());
            retourProduit.setTypeRetour(dto.getSousType().name());
            retourProduit.setDetailVente(detailVente);
            retourProduit.setUtilisateurRetour(currentUserService.getCurrentUser());

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


    private void validateSousType(TypeRetour sousType, String operationType) {
        boolean isValid = switch (operationType.toLowerCase()) {
            case "remboursement" -> sousType == TypeRetour.REMBOURSEMENT_AVEC_RETOUR_BON_ETAT ||
                                   sousType == TypeRetour.REMBOURSEMENT_DEFECTUEUX;
            case "echange" -> sousType == TypeRetour.ECHANGE_DEFECTUEUX ||
                             sousType == TypeRetour.ECHANGE_CHANGEMENT_PREFERENCE ||
                             sousType == TypeRetour.ECHANGE_AJUSTEMENT_PRIX;
            default -> false;
        };
        
        if (!isValid) {
            throw new BaseCustomException(
                    "Sous-type invalide pour l'opération " + operationType,
                    ErrorCodes.INVALID_REQUEST
            );
        }
    }

    private void handleRemboursementBonEtat(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement bon état pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        
        // Traitement du remboursement avec remise en stock
        double montantRembourse = processRemboursement(detailVente, vente, quantiteRetour, true);
        
        logger.info("Remboursement bon état traité: montant={}, stock remis", montantRembourse);
    }

    private void handleRemboursementDefectueux(DetailVente detailVente, Vente vente, int quantiteRetour) {
        logger.debug("Traitement du remboursement défectueux pour DetailVente ID: {}, Quantité: {}", detailVente.getId(), quantiteRetour);
        
        // Traitement du remboursement sans remise en stock
        double montantRembourse = processRemboursement(detailVente, vente, quantiteRetour, false);
        
        logger.info("Remboursement défectueux traité: montant={}, stock non remis", montantRembourse);
    }
    
    /**
     * Méthode commune pour traiter les remboursements
     */
    private double processRemboursement(DetailVente detailVente, Vente vente, int quantiteRetour, boolean remettreEnStock) {
        // Validation de la quantité
        validateQuantiteRetour(detailVente, quantiteRetour);
        
        // Calcul du montant à rembourser
        double montantRembourse = detailVente.getPrixVente() * quantiteRetour;
        
        // Mise à jour du DetailVente
        updateDetailVenteForRemboursement(detailVente, quantiteRetour);
        
        // Remise en stock si nécessaire
        if (remettreEnStock) {
            Produit produit = detailVente.getProduit();
            produit.setStockDisponible(produit.getStockDisponible() + quantiteRetour);
            produitRepository.save(produit);
        }
        
        // SUPPRESSION : Ne plus créer de paiement négatif pour le remboursement
        // Le montant de la vente sera automatiquement recalculé via updateVenteMontants()
        
        // Sauvegarde et recalcul
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
            // Remboursement total
            detailVente.setStatus(StatusDetailVente.RETOURNE_REMBOURSE);
            detailVente.setMontantTotal(0.0);
        } else {
            // Remboursement partiel
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
    }
    

    private void handleEchangeDefectueux(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange défectueux pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        
        // Traitement de l'échange sans remise en stock de l'ancien produit
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, false, false);
        
        logger.info("Échange défectueux traité: ancien produit non remis en stock");
    }

    private void handleEchangeChangementPreference(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange changement de préférence pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        
        // Traitement de l'échange avec remise en stock de l'ancien produit, même prix
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, true, false);
        
        logger.info("Échange changement préférence traité: ancien produit remis en stock");
    }

    private void handleEchangeAjustementPrix(DetailVente detailVente, Vente vente, Long produitRemplacementId, int quantiteRetour) {
        logger.debug("Traitement de l'échange avec ajustement de prix pour DetailVente ID: {}, Quantité: {}, ProduitRemplacementId: {}",
                detailVente.getId(), quantiteRetour, produitRemplacementId);
        
        // Traitement de l'échange avec remise en stock de l'ancien produit, nouveau prix
        processEchange(detailVente, vente, produitRemplacementId, quantiteRetour, true, true);
        
        logger.info("Échange ajustement prix traité: ancien produit remis en stock, nouveau prix appliqué");
    }
    
    /**
     * Méthode commune pour traiter tous les types d'échange
     */
    private void processEchange(DetailVente detailVente, Vente vente, Long produitRemplacementId, 
                               int quantiteRetour, boolean remettreAncienEnStock, boolean nouveauPrix) {
        // Validations communes
        validateQuantiteRetour(detailVente, quantiteRetour);
        
        // Récupération du produit de remplacement
        Produit produitRemplacement = produitRepository.findById(produitRemplacementId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Produit de remplacement introuvable (ID: " + produitRemplacementId + ")",
                        ErrorCodes.ENTITY_NOT_FOUND));
        
        // Vérification du stock du produit de remplacement
        if (produitRemplacement.getStockDisponible() < quantiteRetour) {
            throw new BaseCustomException(
                    "Stock insuffisant pour le produit de remplacement : " + produitRemplacement.getLibelle() +
                    " (Disponible: " + produitRemplacement.getStockDisponible() + ", Demandé: " + quantiteRetour + ")",
                    ErrorCodes.INSUFFICIENT_STOCK
            );
        }
        
        // Remise en stock de l'ancien produit si nécessaire
        if (remettreAncienEnStock) {
            Produit ancienProduit = detailVente.getProduit();
            ancienProduit.setStockDisponible(ancienProduit.getStockDisponible() + quantiteRetour);
            produitRepository.save(ancienProduit);
        }
        
        // Calcul des montants
        double montantRetourne = detailVente.getPrixVente() * quantiteRetour;
        
        // Mise à jour de l'ancien DetailVente
        updateDetailVenteForEchange(detailVente, quantiteRetour);
        
        // Création du nouveau DetailVente
        DetailVente nouveauDetailVente = createNewDetailVente(vente, produitRemplacement, detailVente, quantiteRetour, nouveauPrix);
        
        // Mise à jour du stock du nouveau produit
        produitRemplacement.setStockDisponible(produitRemplacement.getStockDisponible() - quantiteRetour);
        produitRepository.save(produitRemplacement);
        
        // Sauvegardes
        detailVenteRepository.save(detailVente);
        detailVenteRepository.save(nouveauDetailVente);
        vente.getDetailVentes().add(nouveauDetailVente);
        
        // Gestion de l'ajustement de prix si nécessaire
        if (nouveauPrix) {
            double montantAjoute = nouveauDetailVente.getMontantTotal();
            double montantAjuste = montantAjoute - montantRetourne;
            
            // MODIFICATION : Ne plus créer de paiement d'ajustement
            // Le montant sera automatiquement recalculé via updateVenteMontants()
            logger.debug("Ajustement de prix calculé: {} (nouveau: {}, ancien: {})", montantAjuste, montantAjoute, montantRetourne);
        }
        
        // Recalcul final
        updateVenteMontants(vente, 0);
    }
    
    private void updateDetailVenteForEchange(DetailVente detailVente, int quantiteRetour) {
        if (quantiteRetour == detailVente.getQuantiteVendu()) {
            // Échange total
            detailVente.setStatus(StatusDetailVente.RETOURNE_ECHANGE);
            detailVente.setMontantTotal(0.0);
        } else {
            // Échange partiel
            detailVente.setQuantiteVendu(detailVente.getQuantiteVendu() - quantiteRetour);
            detailVente.setMontantTotal(detailVente.getPrixVente() * detailVente.getQuantiteVendu());
        }
    }
    
    private DetailVente createNewDetailVente(Vente vente, Produit produitRemplacement, 
                                           DetailVente ancienDetailVente, int quantiteRetour, boolean nouveauPrix) {
        DetailVente nouveauDetailVente = new DetailVente();
        nouveauDetailVente.setVente(vente);
        nouveauDetailVente.setProduit(produitRemplacement);
        
        // Prix : ancien prix ou nouveau prix selon le type d'échange
        Double prixAUtiliser = nouveauPrix ? produitRemplacement.getPrixVente() : ancienDetailVente.getPrixVente();
        nouveauDetailVente.setPrixVente(prixAUtiliser);
        nouveauDetailVente.setQuantiteVendu(quantiteRetour);
        nouveauDetailVente.setMontantTotal(prixAUtiliser * quantiteRetour);
        nouveauDetailVente.setStatus(StatusDetailVente.VENDU);
        
        return nouveauDetailVente;
    }
    




    private void updateVenteMontants(Vente vente, double montantModifie) {
        logger.debug("Mise à jour des montants pour Vente ID: {}, Montant modifié: {}", vente.getId(), montantModifie);
        
        // CORRECTION: Recalcul basé sur les DetailVente actuels pour éviter les écarts
        double nouveauMontantTotal = vente.getDetailVentes().stream()
                .mapToDouble(DetailVente::getMontantTotal)
                .sum();
        
        logger.debug("Ancien montant total: {}, Nouveau montant total calculé: {}", vente.getMontantTotal(), nouveauMontantTotal);
        vente.setMontantTotal(nouveauMontantTotal);
        
        if (vente.getEstCredit()) {
            // CORRECTION: Calculer le montant total payé en incluant tous les paiements
            double montantTotalPaye = calculerMontantTotalPaye(vente);
            vente.setMontantRestant(Math.max(0.0, nouveauMontantTotal - montantTotalPaye));
            logger.debug("Vente à crédit - Montant payé: {}, Montant restant: {}", montantTotalPaye, vente.getMontantRestant());
        } else {
            vente.setMontantRestant(0.0);
        }
        venteRepository.save(vente);
    }
    
    /**
     * Calcule le montant total payé pour une vente en incluant uniquement les paiements positifs
     * (paiement initial uniquement, les retours/remboursements sont gérés via les DetailVente)
     */
    private double calculerMontantTotalPaye(Vente vente) {
        return vente.getPaiements().stream()
                .filter(p -> p.getMontantVerser() > 0) // Uniquement les paiements positifs
                .mapToDouble(Paiement::getMontantVerser)
                .sum();
    }
    
    /**
     * Récupère le paiement initial de la vente (le premier paiement créé)
     */
    private Paiement getPaiementInitial(Vente vente) {
        return vente.getPaiements().stream()
                .min((p1, p2) -> p1.getDatePaiement().compareTo(p2.getDatePaiement()))
                .orElseThrow(() -> new BaseCustomException(
                        "Aucun paiement initial trouvé pour la vente",
                        ErrorCodes.ENTITY_NOT_FOUND
                ));
    }

    /**
     * MÉTHODE UTILITAIRE : Nettoie les paiements négatifs existants dans la base de données
     * À utiliser une seule fois pour corriger les données existantes
     */
    @Transactional
    public void cleanupNegativePayments() {
        logger.info("Début du nettoyage des paiements négatifs...");
        
        // Récupérer toutes les ventes avec des paiements négatifs
        List<Vente> ventesAvecPaiementsNegatifs = venteRepository.findAll().stream()
                .filter(vente -> vente.getPaiements().stream()
                        .anyMatch(p -> p.getMontantVerser() < 0))
                .toList();
        
        logger.info("Nombre de ventes avec paiements négatifs trouvées: {}", ventesAvecPaiementsNegatifs.size());
        
        for (Vente vente : ventesAvecPaiementsNegatifs) {
            // Supprimer tous les paiements négatifs
            List<Paiement> paiementsNegatifs = vente.getPaiements().stream()
                    .filter(p -> p.getMontantVerser() < 0)
                    .toList();
            
            logger.debug("Suppression de {} paiements négatifs pour la vente ID: {}", 
                    paiementsNegatifs.size(), vente.getId());
            
            for (Paiement paiementNegatif : paiementsNegatifs) {
                vente.getPaiements().remove(paiementNegatif);
                paiementRepository.delete(paiementNegatif);
            }
            
            // Recalculer les montants de la vente
            updateVenteMontants(vente, 0);
        }
        
        logger.info("Nettoyage des paiements négatifs terminé.");
    }
}