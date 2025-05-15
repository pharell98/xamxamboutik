import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import useCategories from '../../../../../hooks/useCategories';
import { newProductSchema } from './validations/approValidation';
import ProductUpload from '../../../../common/ProductUpload';
import { generateProductCode } from '../../../../../helpers/generateProductCode';

/* --------- MUI Autocomplete (type MatChip/Angular‑like) --------- */
import { Autocomplete, TextField } from '@mui/material';

const FormField = ({ name, methods, label, placeholder, type }) => {
  const {
    register,
    formState: { errors }
  } = methods;
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type || 'text'}
        placeholder={placeholder}
        isInvalid={!!errors[name]}
        {...register(name)}
      />
      {errors[name] && (
        <Form.Control.Feedback type="invalid">
          {errors[name].message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  methods: PropTypes.object.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string
};

const NewProductDetails = ({
  currentProduct = null,
  onCompleteProduct = () => {},
  editMode = false
}) => {
  if (!currentProduct) return null;

  const { categories, loading, error } = useCategories();

  const methods = useForm({
    resolver: yupResolver(newProductSchema),
    defaultValues: {
      categorieId: '',
      prixVente: '',
      seuilRuptureStock: '',
      image: null,
      manualCode: false,
      codeProduit: '',
      useImageURL: false,
      imageURL: ''
    }
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
    register,
    setValue,
    watch
  } = methods;

  /* ------------------ Réinitialise si produit change ------------------ */
  useEffect(() => {
    reset({
      categorieId: currentProduct.categorieId
        ? String(currentProduct.categorieId)
        : '',
      prixVente: currentProduct.prixVente
        ? String(currentProduct.prixVente)
        : '',
      seuilRuptureStock: currentProduct.seuilRuptureStock
        ? String(currentProduct.seuilRuptureStock)
        : '',
      image: currentProduct.image || null,
      manualCode: false,
      codeProduit: '',
      useImageURL: false,
      imageURL: ''
    });
  }, [currentProduct, reset]);

  /* -------------------------- WATCHERS -------------------------- */
  const watchedCategory = useWatch({ control, name: 'categorieId' });
  const manualCode = watch('manualCode');
  const useImageURL = watch('useImageURL');
  const imageURLValue = watch('imageURL');

  /* ----------- Génération automatique du code produit ----------- */
  let displayedCode = '';
  if (manualCode) {
    displayedCode = watch('codeProduit') || '';
  } else if (currentProduct.libelle?.trim() && watchedCategory?.trim()) {
    try {
      displayedCode = generateProductCode({
        productName: currentProduct.libelle,
        productCategory: watchedCategory
      });
      setValue('codeProduit', displayedCode);
    } catch (err) {
      console.error('Erreur lors de la génération du code :', err);
    }
  }

  /* ----------------------- Soumission --------------------------- */
  const onSubmit = values => {
    onCompleteProduct(values);
  };

  /* ----------------------- Upload local ------------------------- */
  const handleImageUpload = fileOrEvent => {
    const file =
      fileOrEvent instanceof File
        ? fileOrEvent
        : fileOrEvent?.target?.files?.[0] || fileOrEvent;
    setValue('image', file);
  };

  const renderCategoryStatus = () => {
    if (error) {
      return (
        <div className="text-danger small mt-1">
          Erreur lors du chargement des catégories
        </div>
      );
    }
    if (loading) {
      return (
        <div className="text-muted small mt-1">
          Chargement des catégories...
        </div>
      );
    }
    return null;
  };

  /* ---------------------------- UI ----------------------------- */
  return (
    <Card className="mt-3 border-primary">
      <Card.Header className="bg-primary text-white">
        <h6 className="mb-0">Informations pour : {currentProduct.libelle}</h6>
      </Card.Header>

      <Card.Body>
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="gy-3">
              {/* ----- Code manuel ? ----- */}
              <Col md={12}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Saisir le code produit manuellement ?"
                    {...register('manualCode')}
                  />
                </Form.Group>
              </Col>

              {/* ----- Code produit ----- */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Code Produit</Form.Label>
                  {manualCode ? (
                    <Form.Control
                      type="text"
                      placeholder="Entrez le code produit"
                      {...register('codeProduit')}
                    />
                  ) : (
                    <>
                      <Form.Control
                        type="text"
                        placeholder="Code généré automatiquement"
                        readOnly
                        value={displayedCode || ''}
                      />
                      <input type="hidden" {...register('codeProduit')} />
                    </>
                  )}
                  <Form.Text className="text-muted">
                    {manualCode
                      ? 'Saisissez un code numérique.'
                      : 'Code généré automatiquement.'}
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* ----- Prix de vente ----- */}
              <Col md={6}>
                <FormField
                  name="prixVente"
                  methods={methods}
                  label="Prix de vente *"
                  placeholder="Prix de vente (FCFA)"
                />
              </Col>

              {/* ----- Seuil rupture ----- */}
              <Col md={6}>
                <FormField
                  name="seuilRuptureStock"
                  methods={methods}
                  label="Seuil de rupture de stock *"
                  placeholder="Seuil de rupture"
                  type="number"
                />
              </Col>

              {/* ----- Catégorie (Autocomplete) ----- */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="mb-1">Catégorie *</Form.Label>

                  <Controller
                    name="categorieId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        disablePortal
                        options={categories}
                        loading={loading}
                        getOptionLabel={opt => opt.libelle || ''}
                        isOptionEqualToValue={(opt, val) =>
                          String(opt.id) === String(val.id)
                        }
                        value={
                          categories.find(
                            c => String(c.id) === String(field.value)
                          ) || null
                        }
                        onChange={(_, newVal) =>
                          field.onChange(newVal ? String(newVal.id) : '')
                        }
                        fullWidth
                        disabled={loading}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '38px',
                            paddingRight: '8px'
                          }
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Rechercher une catégorie"
                            error={!!methods.formState.errors.categorieId}
                            helperText={
                              methods.formState.errors.categorieId?.message
                            }
                          />
                        )}
                      />
                    )}
                  />

                  {/* States (chargement / erreur) */}
                  {renderCategoryStatus()}
                </Form.Group>
              </Col>

              {/* ----- Checkbox "URL image ?" ----- */}
              <Col md={12}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Ajouter l'image via URL ?"
                    {...register('useImageURL')}
                  />
                </Form.Group>
              </Col>

              {/* ----- URL + Aperçu ----- */}
              {useImageURL && (
                <Row className="align-items-start">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>URL de l'image</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://exemple.com/image.jpg"
                        {...register('imageURL')}
                      />
                    </Form.Group>
                  </Col>
                  {imageURLValue && (
                    <Col md={6} className="mt-3 mt-md-0">
                      <div className="card">
                        <img
                          src={imageURLValue}
                          alt="Aperçu de l'image"
                          className="img-fluid card-img-top"
                          style={{ objectFit: 'contain', width: '100%' }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              )}

              {/* ----- Upload local ----- */}
              {!useImageURL && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Image du produit</Form.Label>
                    <ProductUpload
                      onImageUpload={handleImageUpload}
                      currentImage={methods.getValues('image')}
                    />
                  </Form.Group>
                </Col>
              )}

              {/* ----- Bouton Valider ----- */}
              <Col md={12} className="text-end mt-4">
                <Button
                  variant={editMode ? 'warning' : 'primary'}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Enregistrement...'
                    : editMode
                    ? 'Valider modification'
                    : 'Valider les informations'}
                </Button>
              </Col>
            </Row>
          </Form>
        </FormProvider>
      </Card.Body>
    </Card>
  );
};

NewProductDetails.propTypes = {
  currentProduct: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    libelle: PropTypes.string,
    codeProduit: PropTypes.string,
    prixAchat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stockDisponible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categorieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prixVente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.any,
    seuilRuptureStock: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onCompleteProduct: PropTypes.func,
  editMode: PropTypes.bool
};

export default NewProductDetails;
