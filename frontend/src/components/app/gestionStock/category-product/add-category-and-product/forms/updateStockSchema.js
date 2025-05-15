// src/components/forms/UpdateStockForm.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import apiServiceV1 from 'services/api.service.v1';
import { useToast } from 'components/common/Toast';

/***********************************
 * UpdateStockForm
 * ---------------------------------
 * • Sélection d’un produit (auto-complétion)
 * • Quantité positive ou négative
 * • Prix d’achat optionnel (nécessaire seulement pour les ajouts)
 * • Validation RHF + Yup
 * • Feedback Toast + reset form
 ***********************************/

// Schéma de validation Yup
const updateStockSchema = yup.object({
  produit: yup
    .object()
    .shape({ id: yup.number().required(), libelle: yup.string() })
    .required('Le produit est obligatoire.'),
  quantite: yup
    .number()
    .typeError('La quantité est obligatoire.')
    .integer('La quantité doit être un entier.')
    .notOneOf([0], 'La quantité ne peut pas être 0.')
    .required('La quantité est obligatoire.'),
  prixAchat: yup
    .number()
    .transform(v => (Number.isNaN(v) ? undefined : v))
    .nullable()
    .when('quantite', (quantite, schema) =>
      quantite > 0
        ? schema
            .required('Le prix d’achat est requis pour une entrée de stock.')
            .min(0, 'Le prix d’achat doit être positif.')
        : schema.notRequired()
    )
});

const defaultValues = {
  produit: null,
  quantite: '',
  prixAchat: ''
};

const UpdateStockForm = ({ onSuccess, onSwitchForm }) => {
  const methods = useForm({
    resolver: yupResolver(updateStockSchema),
    defaultValues
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = methods;

  const { addToast } = useToast();

  const onSubmit = async data => {
    try {
      const payload = {
        produitId: data.produit.id,
        quantite: Number(data.quantite),
        prixAchat: data.prixAchat ? Number(data.prixAchat) : null
      };
      await apiServiceV1.updateStock(payload);
      addToast({
        title: 'Succès',
        message: `Stock du produit "${data.produit.libelle}" mis à jour !`,
        type: 'success'
      });
      reset(defaultValues);
      onSuccess?.();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        `Erreur lors de la mise à jour : ${error.message}`;
      addToast({ title: 'Erreur', message: msg, type: 'error' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-sm">
          <Card.Header
            as="h6"
            className="bg-body-tertiary d-flex justify-content-between align-items-center"
          >
            Mise à jour du stock
            <ToggleButtonGroup
              value="stock"
              exclusive
              onChange={(_, newForm) => newForm && onSwitchForm(newForm)}
              size="small"
            >
              <ToggleButton value="product">Produit</ToggleButton>
              <ToggleButton value="stock">Stock</ToggleButton>
            </ToggleButtonGroup>
          </Card.Header>
          <Card.Body>
            {/* Sélection du produit */}
            <Row className="mb-3">
              <Col md="12">
                <Form.Group>
                  <Form.Label className="fw-bold">Produit :</Form.Label>
                  <Controller
                    name="produit"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <ProductAutocomplete
                        selected={value}
                        onSelect={onChange}
                        error={!!errors.produit}
                        helperText={errors.produit?.message}
                      />
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Quantité & Prix */}
            <Row className="mb-3">
              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Quantité (+/-) :</Form.Label>
                  <Controller
                    name="quantite"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="number"
                        placeholder="ex : 10 ou -5"
                        isInvalid={!!errors.quantite}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.quantite?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Prix d’achat (optionnel) :
                  </Form.Label>
                  <Controller
                    name="prixAchat"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="ex : 2500"
                        isInvalid={!!errors.prixAchat}
                        {...field}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.prixAchat?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="px-4"
              >
                {isSubmitting ? 'Mise à jour…' : 'Mettre à jour'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </form>
    </FormProvider>
  );
};

const ProductAutocomplete = ({ selected, onSelect, error, helperText }) => {
  const [options, setOptions] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      if (!inputValue) return;
      try {
        const res = await apiServiceV1.getProductSuggestions(inputValue, 1, 8);
        if (active) setOptions(res.data?.content || []);
      } catch (e) {
        console.error('[ProductAutocomplete] fetch error:', e);
      }
    })();
    return () => {
      active = false;
    };
  }, [inputValue]);

  return (
    <Autocomplete
      disablePortal
      options={options}
      getOptionLabel={opt => opt.libelle || ''}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      value={selected}
      onChange={(_, newVal) => onSelect(newVal)}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      fullWidth
      renderInput={params => (
        <TextField
          {...params}
          placeholder="Rechercher un produit"
          size="small"
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

ProductAutocomplete.propTypes = {
  selected: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string
};

UpdateStockForm.propTypes = {
  onSuccess: PropTypes.func,
  onSwitchForm: PropTypes.func
};

export default React.memo(UpdateStockForm);
