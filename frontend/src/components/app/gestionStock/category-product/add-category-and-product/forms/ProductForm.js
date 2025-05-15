import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { basicInformationSchema } from 'components/app/validatore/basicInformationSchema';
import { generateProductCode } from 'helpers/generateProductCode';
import ProductUpload from 'components/common/ProductUpload';

/* ---- MUI (MatChip‑like Autocomplete & ToggleButtonGroup) ---- */
import {
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

const defaultInitialValues = {
  categorieProduit: '',
  libelle: '',
  prixAchat: '',
  prixVente: '',
  stockDisponible: '',
  seuilRuptureStock: '',
  codeProduit: '',
  manualCode: false,
  imageProduit: null,
  useImageURL: false,
  imageURL: '',
  id: null,
  currentImage: ''
};

const ProductForm = ({
  categories,
  onSubmit,
  onUpdate,
  onCancel,
  onSwitchForm,
  initialValues = defaultInitialValues,
  isEditMode = false
}) => {
  /* ----------------------------- RHF ----------------------------- */
  const mergedInitialValues = useMemo(
    () => ({ ...defaultInitialValues, ...initialValues }),
    [initialValues]
  );

  const methods = useForm({
    resolver: yupResolver(basicInformationSchema),
    defaultValues: mergedInitialValues
  });
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { errors }
  } = methods;

  /* ----------------------------- WATCH ---------------------------- */
  const imageField = watch('imageProduit');
  const currentFormId = watch('id');
  const manualCode = watch('manualCode');
  const useImageURL = watch('useImageURL');
  const imageURLValue = watch('imageURL');
  const currentCategory = watch('categorieProduit');
  const currentName = watch('libelle');

  /* ------------- Reset form quand on change de produit ------------ */
  useEffect(() => {
    let catId = '';
    if (mergedInitialValues.categorieProduit) {
      catId = mergedInitialValues.categorieProduit;
    } else if (
      typeof mergedInitialValues.categorie === 'object' &&
      mergedInitialValues.categorie !== null
    ) {
      catId = mergedInitialValues.categorie.id;
    } else if (typeof mergedInitialValues.categorie === 'string') {
      const foundCat = categories.find(
        c =>
          c.libelle?.toLowerCase() ===
          mergedInitialValues.categorie.toLowerCase()
      );
      catId = foundCat ? foundCat.id : '';
    }
    if (mergedInitialValues.id !== currentFormId) {
      reset({ ...mergedInitialValues, categorieProduit: catId });
    }
  }, [mergedInitialValues, currentFormId, reset, categories]);

  /* ----------- Génère un code produit seulement en création -------- */
  useEffect(() => {
    if (!manualCode && currentCategory && currentName && !isEditMode) {
      const selectedCat = categories.find(
        c => String(c.id) === String(currentCategory)
      );
      const categoryName = selectedCat ? selectedCat.libelle : currentCategory;
      const code = generateProductCode({
        productName: currentName,
        productCategory: categoryName
      });
      setValue('codeProduit', code);
    }
  }, [
    manualCode,
    currentCategory,
    currentName,
    setValue,
    categories,
    isEditMode
  ]);

  /* ------------------------ Build FormData ----------------------- */
  const buildFormData = data => {
    const formData = new FormData();
    if (isEditMode && !data.id) {
      console.error("[ProductForm] 🚨 L'ID est manquant !");
      return null;
    }
    const produit = {
      id: data.id || null,
      codeProduit: data.codeProduit,
      libelle: data.libelle,
      prixAchat: data.prixAchat,
      prixVente: data.prixVente,
      stockDisponible: data.stockDisponible,
      seuilRuptureStock: data.seuilRuptureStock,
      categorieId: data.categorieProduit ? Number(data.categorieProduit) : null,
      imageURL: data.useImageURL ? data.imageURL : undefined
    };

    formData.append(
      'produit',
      new File([JSON.stringify(produit)], 'produit.json', {
        type: 'application/json'
      })
    );

    if (!data.useImageURL && data.imageProduit?.length) {
      formData.append('file', data.imageProduit[0]);
    }
    return formData;
  };

  /* ---------------------- Submit handler ------------------------- */
  const handleFormSubmit = data => {
    const formData = buildFormData(data);
    if (!formData) return;

    if (isEditMode) {
      onUpdate ? onUpdate(formData, true, data.id) : onSubmit(formData);
    } else {
      onSubmit(formData);
      reset(defaultInitialValues);
    }
  };

  /* --------------------------- UI -------------------------------- */
  const buttonLabel = isEditMode
    ? 'Modifier le produit'
    : 'Ajouter un nouveau produit';
  const buttonVariant = isEditMode ? 'warning' : 'primary';

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card className="mb-0 shadow-sm">
          <Card.Header
            as="h6"
            className="bg-body-tertiary d-flex justify-content-between align-items-center"
          >
            {buttonLabel}
            <ToggleButtonGroup
              value="product"
              exclusive
              onChange={(_, newForm) => newForm && onSwitchForm(newForm)}
              size="small"
            >
              <ToggleButton value="product">Produit</ToggleButton>
              <ToggleButton value="stock">Stock</ToggleButton>
            </ToggleButtonGroup>
          </Card.Header>

          <Card.Body>
            {/* ---------- Code & Libellé ---------- */}
            <Row>
              <Col md="12">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="manualCodeCheck"
                    label="Saisir un code produit manuellement ?"
                    {...register('manualCode')}
                    style={{ transform: 'scale(.8)' }}
                    className="fs-6"
                  />
                  <small className="text-muted">
                    Activez pour un code personnalisé (chiffres seulement).
                  </small>
                </Form.Group>
              </Col>

              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Code Produit:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={
                      manualCode
                        ? 'Entrez le code produit'
                        : 'Code généré automatiquement'
                    }
                    readOnly={!manualCode}
                    isInvalid={!!errors.codeProduit}
                    {...register('codeProduit')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.codeProduit?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Libellé du produit:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom du produit"
                    isInvalid={!!errors.libelle}
                    {...register('libelle')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.libelle?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ---------- Catégorie (Autocomplete) & Prix d’achat ---------- */}
            <Row className="mt-3">
              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold mb-1">Catégorie:</Form.Label>

                  {/* Autocomplete (type MatChip/Angular‑like) */}
                  <Controller
                    name="categorieProduit"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        disablePortal /* menu plus léger */
                        options={categories}
                        getOptionLabel={opt => opt.libelle || ''}
                        isOptionEqualToValue={(opt, val) =>
                          String(opt.id) === String(val.id)
                        }
                        value={
                          categories.find(
                            c => String(c.id) === String(field.value)
                          ) ?? null
                        }
                        onChange={(_, newVal) =>
                          field.onChange(newVal ? newVal.id : '')
                        }
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '38px', // même hauteur que Form.Control
                            paddingRight: '8px'
                          }
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            placeholder="Rechercher une catégorie"
                            size="small"
                            error={!!errors.categorieProduit}
                            helperText={errors.categorieProduit?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Form.Group>
              </Col>

              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Prix d’achat:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    isInvalid={!!errors.prixAchat}
                    {...register('prixAchat')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.prixAchat?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ---------- Prix vente / Seuil stock ---------- */}
            <Row className="mt-3">
              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Prix de vente:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    isInvalid={!!errors.prixVente}
                    {...register('prixVente')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.prixVente?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Seuil rupture:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    isInvalid={!!errors.seuilRuptureStock}
                    {...register('seuilRuptureStock')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.seuilRuptureStock?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ---------- Stock & Image actuelle ---------- */}
            <Row className="mt-3">
              <Col md="6">
                <Form.Group>
                  <Form.Label className="fw-bold">Stock disponible:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    isInvalid={!!errors.stockDisponible}
                    {...register('stockDisponible')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.stockDisponible?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md="6">
                {isEditMode && mergedInitialValues.currentImage && (
                  <div className="mb-3">
                    <strong>Image actuelle:</strong>
                    <img
                      src={mergedInitialValues.currentImage}
                      alt="Image actuelle"
                      className="img-thumbnail"
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Col>
            </Row>

            <hr className="my-4" />

            {/* ---------- Image URL vs Upload ---------- */}
            <Row className="mt-3">
              <Col md="12">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="useImageURLCheck"
                    label="Ajouter une image via URL ?"
                    {...register('useImageURL')}
                    style={{ transform: 'scale(.8)' }}
                    className="fs-6"
                  />
                  <small className="text-muted">
                    Cochez pour saisir une URL (ou data URL); sinon, téléversez
                    un fichier.
                  </small>
                </Form.Group>
              </Col>

              {useImageURL ? (
                <Col md="12">
                  <Form.Group>
                    <Form.Label className="fw-bold">URL de l'image:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://exemple.com/image.jpg"
                      isInvalid={!!errors.imageURL}
                      {...register('imageURL')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.imageURL?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {imageURLValue && (
                    <Card className="mt-3" style={{ width: '18rem' }}>
                      <Card.Img
                        variant="top"
                        src={imageURLValue}
                        alt="Pré‑visualisation"
                        style={{ objectFit: 'cover', height: 150 }}
                      />
                    </Card>
                  )}
                </Col>
              ) : (
                <Col md="12">
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      Image du produit (optionnel):
                    </Form.Label>
                    <ProductUpload
                      currentImage={
                        (Array.isArray(imageField) && imageField[0]) || null
                      }
                      onImageUpload={file =>
                        setValue('imageProduit', file ? [file] : null)
                      }
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            {/* ---------- Boutons ---------- */}
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant={buttonVariant}
                type="submit"
                className="me-2 px-4"
              >
                {buttonLabel}
              </Button>
              {isEditMode && onCancel && (
                <Button variant="danger" onClick={onCancel} className="px-4">
                  Annuler
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </form>
    </FormProvider>
  );
};

ProductForm.propTypes = {
  categories: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  onSwitchForm: PropTypes.func,
  initialValues: PropTypes.object,
  isEditMode: PropTypes.bool
};

export default React.memo(ProductForm);
