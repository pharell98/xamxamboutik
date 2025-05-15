import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Form, Image, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ProductUpload from '../../common/ProductUpload';
import { shopSettingsSchema } from '../validatore/validatorsParametrage';

const defaultInitialValues = {
  shopName: '',
  logo: null,
  email: '',
  phone: '',
  country: '',
  region: '',
  department: '',
  neighborhood: '',
  street: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  websiteUrl: '',
  id: null
};

const ShopSettingsForm = ({
  initialValues = defaultInitialValues,
  onSubmit,
  isEditMode = false
}) => {
  const mergedInitialValues = useMemo(
    () => ({ ...defaultInitialValues, ...(initialValues || {}) }),
    [initialValues]
  );

  const methods = useForm({
    resolver: yupResolver(shopSettingsSchema),
    defaultValues: mergedInitialValues
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = methods;

  useEffect(() => {
    reset(mergedInitialValues);
  }, [mergedInitialValues.id, reset]);

  const logoField = watch('logo');

  const handleFormSubmit = data => {
    const formData = new FormData();
    formData.append(
      'settings',
      new File([JSON.stringify({ ...data, logo: null })], 'settings.json', {
        type: 'application/json'
      })
    );
    if (data.logo && (data.logo instanceof File || data.logo instanceof Blob)) {
      const fileName = data.logo.name || 'image.jpg';
      const file = new File([data.logo], fileName, { type: data.logo.type });
      formData.append('file', file);
    }
    onSubmit(formData);
    reset(defaultInitialValues);
  };

  const currentImage = useMemo(() => {
    if (mergedInitialValues.logo?.preview) {
      return { url: mergedInitialValues.logo.preview };
    }
    return null;
  }, [mergedInitialValues.logo]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card className="shadow-sm border-0 rounded">
          <Card.Header as="h6" className="bg-body-tertiary rounded-top">
            {isEditMode || initialValues?.id
              ? 'Modifier les paramètres'
              : 'Ajouter les paramètres'}
          </Card.Header>
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-3 text-primary">
              Informations générales
            </h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Nom de la boutique :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le nom de la boutique"
                    isInvalid={!!errors.shopName}
                    className="rounded"
                    {...register('shopName')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.shopName?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Logo de la boutique (optionnel) :
                  </Form.Label>
                  <Row>
                    <Col xs={6}>
                      <ProductUpload
                        onImageUpload={file =>
                          setValue('logo', file, { shouldValidate: true })
                        }
                        acceptedTypes={{
                          'image/jpeg': ['.jpg', '.jpeg'],
                          'image/png': ['.png'],
                          'image/svg+xml': ['.svg']
                        }}
                      />
                    </Col>
                    <Col xs={6}>
                      {currentImage?.url && (
                        <Card className="shadow-sm border-0">
                          <Card.Body className="p-2 text-center">
                            <Image
                              src={currentImage.url}
                              alt="Logo Preview"
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: 'cover'
                              }}
                              onError={e => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <Card.Text className="mt-2 text-muted">
                              Aperçu du logo
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      )}
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
            <hr className="my-4" />
            <h6 className="fw-bold mb-3 text-primary">
              Informations de contact
            </h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Adresse e-mail :</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="exemple@boutique.com"
                    isInvalid={!!errors.email}
                    className="rounded"
                    {...register('email')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Numéro de téléphone :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="+1234567890"
                    isInvalid={!!errors.phone}
                    className="rounded"
                    {...register('phone')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Pays (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le pays"
                    isInvalid={!!errors.country}
                    className="rounded"
                    {...register('country')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.country?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Région (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez la région"
                    isInvalid={!!errors.region}
                    className="rounded"
                    {...register('region')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.region?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Département (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le département"
                    isInvalid={!!errors.department}
                    className="rounded"
                    {...register('department')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.department?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Quartier (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le quartier"
                    isInvalid={!!errors.neighborhood}
                    className="rounded"
                    {...register('neighborhood')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.neighborhood?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Rue (optionnel) :</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez la rue"
                    isInvalid={!!errors.street}
                    className="rounded"
                    {...register('street')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.street?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Facebook (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://facebook.com/votreboutique"
                    isInvalid={!!errors.facebookUrl}
                    className="rounded"
                    {...register('facebookUrl')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.facebookUrl?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Instagram (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://instagram.com/votreboutique"
                    isInvalid={!!errors.instagramUrl}
                    className="rounded"
                    {...register('instagramUrl')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.instagramUrl?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Twitter (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://twitter.com/votreboutique"
                    isInvalid={!!errors.twitterUrl}
                    className="rounded"
                    {...register('twitterUrl')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.twitterUrl?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    Site web (optionnel) :
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://www.votreboutique.com"
                    isInvalid={!!errors.websiteUrl}
                    className="rounded"
                    {...register('websiteUrl')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.websiteUrl?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant={
                  isEditMode || initialValues?.id ? 'warning' : 'primary'
                }
                type="submit"
                className="px-4 rounded"
                style={{ transition: 'all 0.2s ease-in-out' }}
              >
                {isEditMode || initialValues?.id ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </form>
    </FormProvider>
  );
};

ShopSettingsForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool
};

export default React.memo(ShopSettingsForm);
