import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { productSchema } from './validations/approValidation';
import apiServiceV1 from '../../../../../services/api.service.v1';

// Composant d'un champ générique
const FormField = ({
  name,
  methods,
  placeholder = '',
  type = 'text',
  onChange
}) => {
  const {
    register,
    formState: { errors }
  } = methods;

  return (
    <div className="mb-2">
      <Form.Control
        type={type}
        autoComplete="off" // Désactive l'autocomplétion HTML native
        placeholder={placeholder}
        {...register(name)}
        isInvalid={!!errors[name]}
        size="sm"
        onChange={onChange}
      />
      {errors[name] && (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  methods: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func
};

/**
 * Formulaire de base :
 * - Saisie libellé/prix/stock
 * - Suggestions au fur et à mesure
 */
const ProductForm = ({
  onAddProduct,
  onSelectExistingProduct,
  showAdditionalFields,
  shouldResetBaseFields,
  onResetDone
}) => {
  // Setup react-hook-form
  const methods = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      libelle: '',
      prixAchat: '',
      stockDisponible: ''
    }
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    setValue
  } = methods;

  // État local pour les suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestionList, setShowSuggestionList] = useState(false);

  // Observer le champ "libelle"
  const libelleValue = watch('libelle');

  // Reset si on nous le demande
  useEffect(() => {
    if (shouldResetBaseFields) {
      reset();
      onResetDone();
    }
  }, [shouldResetBaseFields]);

  // Charger les suggestions à chaque fois que libelleValue change
  useEffect(() => {
    const fetchSuggestions = async query => {
      if (!query) {
        setSuggestions([]);
        setShowSuggestionList(false);
        return;
      }
      setLoadingSuggestions(true);

      try {
        const data = await apiServiceV1.getApprovisionnementSuggestions(query);

        // IMPORTANT : ajuster selon votre JSON
        // Si c'est data?.data?.content, faites :
        //   const items = data?.data?.content || [];
        // Si c'est data?.content, faites :
        //   const items = data?.content || [];
        const items = data?.data?.content || [];
        setSuggestions(items);
        setShowSuggestionList(items.length > 0);
      } catch (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions(libelleValue);
  }, [libelleValue]);

  // Quand on clique sur une suggestion
  const handleSelectSuggestion = product => {
    if (!product || !onSelectExistingProduct) return;

    // On appelle la prop parent pour l'ajouter
    onSelectExistingProduct(product);

    // Nettoyage
    reset();
    setSuggestions([]);
    setShowSuggestionList(false);
  };

  // Soumission => créé un nouveau produit (manuel)
  const onSubmit = values => {
    onAddProduct(values);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <h6 className="mb-3">
          Ajouter un nouveau produit ou sélectionner un existant
        </h6>

        <Row className="gx-2">
          {/* Champ Libellé + suggestions */}
          <Col sm={4} style={{ position: 'relative' }}>
            <FormField
              name="libelle"
              methods={methods}
              placeholder="Libellé"
              onChange={e => {
                setValue('libelle', e.target.value);
              }}
            />

            {/* Liste déroulante des suggestions */}
            {showSuggestionList && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 9999, // grand z-index pour être sûr d'être au-dessus
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  maxHeight: 200,
                  overflowY: 'auto',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}
              >
                {loadingSuggestions && (
                  <div className="p-2 text-muted" style={{ fontSize: 14 }}>
                    Chargement...
                  </div>
                )}
                {!loadingSuggestions && suggestions.length === 0 && (
                  <div className="p-2 text-muted" style={{ fontSize: 14 }}>
                    Aucune suggestion trouvée.
                  </div>
                )}
                {!loadingSuggestions &&
                  suggestions.map(item => (
                    <div
                      key={item.id}
                      className="p-2"
                      style={{
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseOver={e =>
                        (e.currentTarget.style.background = '#f8f9fa')
                      }
                      onMouseOut={e =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      {item.libelle}
                    </div>
                  ))}
              </div>
            )}
          </Col>

          {/* Champ Prix d'achat */}
          <Col sm={3}>
            <FormField
              name="prixAchat"
              methods={methods}
              placeholder="Prix d'achat (FCFA)"
            />
          </Col>

          {/* Champ Stock disponible */}
          <Col sm={3}>
            <FormField
              name="stockDisponible"
              methods={methods}
              placeholder="Stock disponible"
            />
          </Col>

          {/* Bouton Ajouter */}
          <Col sm={2} className="d-flex align-items-start">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="w-100"
              disabled={isSubmitting || showAdditionalFields}
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </Col>
        </Row>
      </form>
    </FormProvider>
  );
};

ProductForm.propTypes = {
  onAddProduct: PropTypes.func.isRequired,
  onSelectExistingProduct: PropTypes.func,
  showAdditionalFields: PropTypes.bool,
  shouldResetBaseFields: PropTypes.bool.isRequired,
  onResetDone: PropTypes.func.isRequired
};

export default ProductForm;
