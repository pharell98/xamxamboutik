import React, { useRef, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Overlay,
  Row,
  Spinner,
  Tooltip
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import venteServiceV1 from 'services/vente.service.v1';
import { FaBan, FaExchangeAlt, FaUndo } from 'react-icons/fa';
import PropTypes from 'prop-types';
import ActionInput from './ActionInput';

const SaleActionForm = ({
  detailVenteId,
  onSuccess,
  onCancel,
  addToast,
  initialAction,
  quantiteVendu,
  status
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const motifRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({ mode: 'onChange' });

  // Vérification initiale du statut pour désactiver le formulaire si nécessaire
  const isActionDisabled = status !== 'VENDU';

  const actionConfigs = {
    remboursementBonEtat: {
      title: 'Remboursement - Produit en bon état',
      icon: <FaUndo className="me-1" />,
      description:
        'Rembourser un produit en bon état et le réintégrer au stock.',
      endpoint: venteServiceV1.createRemboursementBonEtat,
      fields: [
        {
          name: 'motif',
          label: 'Motif du remboursement',
          type: 'select',
          options: [
            "Changement d'avis",
            'Erreur de commande',
            "Produit non conforme à l'attente"
          ],
          placeholder: 'Sélectionner un motif',
          tooltip:
            'Choisissez la raison du remboursement pour ce produit en bon état.'
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à retourner',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à rembourser."
        }
      ]
    },
    remboursementDefectueux: {
      title: 'Remboursement - Produit défectueux',
      icon: <FaUndo className="me-1" />,
      description:
        'Rembourser un produit défectueux sans réintégration au stock.',
      endpoint: venteServiceV1.createRemboursementDefectueux,
      fields: [
        {
          name: 'motif',
          label: 'Motif du remboursement',
          type: 'select',
          options: [
            'Produit endommagé',
            'Défaut de fabrication',
            'Non fonctionnel'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip:
            'Choisissez la raison du remboursement pour ce produit défectueux.'
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à retourner',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à rembourser."
        }
      ]
    },
    echangeDefectueux: {
      title: 'Échange - Produit défectueux',
      icon: <FaExchangeAlt className="me-1" />,
      description:
        'Échanger un produit défectueux contre un produit identique ou équivalent.',
      endpoint: venteServiceV1.createEchangeDefectueux,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'échange",
          type: 'select',
          options: [
            'Produit défectueux',
            'Défaut de fabrication',
            'Non fonctionnel'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip:
            "Choisissez la raison de l'échange pour ce produit défectueux."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à échanger',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à échanger."
        },
        {
          name: 'produitRemplacementId',
          label: 'ID du produit de remplacement',
          type: 'number',
          placeholder: 'ID produit (ex. 456)',
          tooltip: 'Identifiant du produit à utiliser comme remplacement.'
        }
      ]
    },
    echangeChangementPreference: {
      title: 'Échange - Changement de préférence',
      icon: <FaExchangeAlt className="me-1" />,
      description:
        'Échanger un produit pour une autre taille, couleur ou modèle.',
      endpoint: venteServiceV1.createEchangeChangementPreference,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'échange",
          type: 'select',
          options: [
            'Mauvaise taille',
            'Mauvaise couleur',
            'Changement de préférence'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip:
            "Choisissez la raison de l'échange pour ce changement de préférence."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à échanger',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à échanger."
        },
        {
          name: 'produitRemplacementId',
          label: 'ID du produit de remplacement',
          type: 'number',
          placeholder: 'ID produit (ex. 456)',
          tooltip: 'Identifiant du produit à utiliser comme remplacement.'
        }
      ]
    },
    echangeAjustementPrix: {
      title: 'Échange - Ajustement de prix',
      icon: <FaExchangeAlt className="me-1" />,
      description:
        'Échanger un produit avec ajustement du prix si le remplacement a un coût différent.',
      endpoint: venteServiceV1.createEchangeAjustementPrix,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'échange",
          type: 'select',
          options: [
            'Mauvaise taille',
            'Mauvaise couleur',
            'Changement de modèle'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip: "Choisissez la raison de l'échange avec ajustement de prix."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à échanger',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à échanger."
        },
        {
          name: 'produitRemplacementId',
          label: 'ID du produit de remplacement',
          type: 'number',
          placeholder: 'ID produit (ex. 456)',
          tooltip: 'Identifiant du produit à utiliser comme remplacement.'
        }
      ]
    },
    annulationApresLivraison: {
      title: 'Annulation - Après livraison',
      icon: <FaBan className="me-1" />,
      description: 'Annuler une vente après livraison avec retour du produit.',
      endpoint: venteServiceV1.createAnnulationApresLivraison,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'annulation",
          type: 'select',
          options: [
            "Changement d'avis",
            'Erreur de livraison',
            'Produit non souhaité'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip: "Choisissez la raison de l'annulation après livraison."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à annuler',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à annuler."
        }
      ]
    },
    annulationPartielle: {
      title: 'Annulation - Partielle',
      icon: <FaBan className="me-1" />,
      description: 'Annuler une partie de la vente avec retour partiel.',
      endpoint: venteServiceV1.createAnnulationPartielle,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'annulation",
          type: 'select',
          options: [
            'Erreur de quantité',
            'Produit non souhaité',
            'Changement partiel'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip: "Choisissez la raison de l'annulation partielle."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à annuler',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à annuler."
        }
      ]
    },
    annulationNonConformite: {
      title: 'Annulation - Non-conformité',
      icon: <FaBan className="me-1" />,
      description:
        'Annuler une vente pour un produit non conforme à la commande.',
      endpoint: venteServiceV1.createAnnulationNonConformite,
      fields: [
        {
          name: 'motif',
          label: "Motif de l'annulation",
          type: 'select',
          options: [
            'Mauvais produit livré',
            'Spécifications incorrectes',
            'Produit endommagé'
          ],
          placeholder: 'Sélectionner un motif',
          tooltip: "Choisissez la raison de l'annulation pour non-conformité."
        },
        {
          name: 'quantiteRetour',
          label: 'Quantité à annuler',
          type: 'number',
          placeholder: 'Quantité (ex. 1)',
          tooltip: "Nombre d'unités à annuler."
        }
      ]
    }
  };

  const selectedAction = initialAction;
  if (!selectedAction || !actionConfigs[selectedAction]) {
    console.log('[SaleActionForm] Invalid or missing action:', initialAction);
    return null;
  }

  const onFormSubmit = async data => {
    if (!addToast) {
      console.error('[SaleActionForm] Toast function is not available');
      return;
    }
    if (isActionDisabled) {
      console.log('[SaleActionForm] Action disabled due to status:', status);
      addToast({
        title: 'Erreur',
        message:
          'Action non disponible : le produit a déjà été retourné, échangé ou annulé.',
        type: 'error',
        icon: 'exclamation-circle'
      });
      return;
    }
    console.log(
      '[SaleActionForm] Submitting action:',
      selectedAction,
      'with data:',
      data
    );
    setIsSubmitting(true);
    try {
      const quantiteRetour = parseInt(data.quantiteRetour, 10);
      console.log('[SaleActionForm] Parsed quantiteRetour:', quantiteRetour);
      if (quantiteRetour > quantiteVendu) {
        console.error(
          '[SaleActionForm] Quantité à retourner dépasse la quantité vendue:',
          quantiteRetour,
          quantiteVendu
        );
        throw new Error('La quantité à retourner dépasse la quantité vendue.');
      }
      const payload = {
        detailVenteId,
        motif: data.motif,
        quantiteRetour: quantiteRetour,
        ...(selectedAction.includes('echange') && {
          produitRemplacementId: parseInt(data.produitRemplacementId, 10)
        })
      };
      console.log('[SaleActionForm] Payload for API:', payload);
      await actionConfigs[selectedAction].endpoint(payload);
      console.log('[SaleActionForm] Action successful:', selectedAction);
      addToast({
        title: 'Succès',
        message: `${actionConfigs[selectedAction].title} effectué avec succès pour le produit sélectionné.`,
        type: 'success',
        icon: 'check-circle'
      });
      onSuccess();
    } catch (error) {
      const serverMessage =
        error.message ||
        `Erreur lors de l'exécution de ${actionConfigs[
          selectedAction
        ].title.toLowerCase()}.`;
      console.error('[SaleActionForm] Error during action:', serverMessage);
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error',
        icon: 'exclamation-circle'
      });
    } finally {
      setIsSubmitting(false);
      console.log(
        '[SaleActionForm] Submission completed, isSubmitting set to false'
      );
    }
  };

  return (
    <Row className="mb-3">
      <style>
        {`
          .form-container {
            animation: slideIn 0.4s ease-out;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .form-container:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .btn-primary {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border: none;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            padding: 0.4rem 1.2rem;
          }
          .btn-primary:hover {
            background: linear-gradient(135deg, #0056b3 0%, #003d80 100%);
            transform: scale(1.05);
          }
          .btn-outline-secondary {
            transition: all 0.3s ease;
            font-size: 0.9rem;
            padding: 0.4rem 1.2rem;
          }
          .btn-outline-secondary:hover {
            background-color: #f8f9fa;
            transform: scale(1.05);
          }
          .form-group {
            margin-bottom: 0.8rem !important;
          }
          .card-body {
            padding: 1rem !important;
          }
          .card-header {
            padding: 0.6rem 1rem !important;
          }
          h5 {
            font-size: 1rem;
          }
          .form-control:focus, .form-select:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }
          .disabled-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            font-size: 0.9rem;
          }
        `}
      </style>
      <Col md={12}>
        <Card className="form-container">
          <Card.Header className="bg-primary text-white d-flex align-items-center">
            <h5 className="mb-0">
              {actionConfigs[selectedAction].icon}
              {actionConfigs[selectedAction].title}
            </h5>
            {isSubmitting && (
              <Spinner animation="border" size="sm" className="ms-auto" />
            )}
          </Card.Header>
          <Card.Body>
            {isActionDisabled ? (
              <div className="disabled-message">
                Action non disponible : le produit a déjà été retourné, échangé
                ou annulé.
                <br />
                Note : Pour permettre des retours partiels, le backend doit
                fournir la quantité restante à retourner.
              </div>
            ) : (
              <>
                <p className="text-muted mb-2 fs-10">
                  {actionConfigs[selectedAction].description}
                </p>
                <Form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                  {actionConfigs[selectedAction].fields.map(field => (
                    <Form.Group key={field.name} className="position-relative">
                      <ActionInput
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        options={field.options}
                        placeholder={field.placeholder}
                        errors={errors}
                        formGroupProps={{ className: 'mb-0' }}
                        formControlProps={{
                          ...register(field.name, {
                            required: `${field.label} est obligatoire`,
                            ...(field.type === 'number' && {
                              min: {
                                value: 1,
                                message: 'La quantité doit être supérieure à 0'
                              },
                              max: {
                                value: quantiteVendu,
                                message: `La quantité ne peut pas dépasser ${quantiteVendu}`
                              }
                            })
                          }),
                          'aria-describedby': `${field.name}-tooltip`
                        }}
                        ref={field.name === 'motif' ? motifRef : null}
                      />
                      <Overlay
                        target={motifRef.current}
                        show={field.name === 'motif' && !watch(field.name)}
                        placement="right"
                      >
                        <Tooltip id={`${field.name}-tooltip`}>
                          {field.tooltip}
                        </Tooltip>
                      </Overlay>
                      {errors[field.name] && (
                        <Form.Text className="text-danger fs-10">
                          {errors[field.name].message}
                        </Form.Text>
                      )}
                      {!errors[field.name] && watch(field.name) && (
                        <Form.Text className="text-success fs-10">
                          Valide
                        </Form.Text>
                      )}
                    </Form.Group>
                  ))}
                  <Row>
                    <Col className="text-end">
                      <Button
                        variant="outline-secondary"
                        className="mt-2 me-2"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        aria-label="Annuler l'action"
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="primary"
                        className="mt-2"
                        type="submit"
                        disabled={isSubmitting || isActionDisabled}
                        aria-label={`Soumettre ${actionConfigs[selectedAction].title}`}
                      >
                        {isSubmitting ? 'En cours...' : 'Soumettre'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

SaleActionForm.propTypes = {
  detailVenteId: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  addToast: PropTypes.func,
  initialAction: PropTypes.oneOf([
    'remboursementBonEtat',
    'remboursementDefectueux',
    'echangeDefectueux',
    'echangeChangementPreference',
    'echangeAjustementPrix',
    'annulationApresLivraison',
    'annulationPartielle',
    'annulationNonConformite'
  ]).isRequired,
  quantiteVendu: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired
};

export default SaleActionForm;
