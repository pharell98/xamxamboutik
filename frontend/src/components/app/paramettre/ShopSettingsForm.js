import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Col, Form, Image, Row, Alert } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faSave,
  faEdit,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import ProductUpload from '../../common/ProductUpload';
import { shopSettingsSchema } from '../validatore/validatorsParametrage';

// Styles CSS personnalisés
const customStyles = `
  .settings-form-card {
    transition: all 0.3s ease-in-out;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  .settings-form-card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .form-control-custom {
    background-color: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
    transition: all 0.2s ease-in-out;
  }
  
  .form-control-custom:focus {
    background-color: #ffffff !important;
    border-color: #86b7fe !important;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
  }
  
  .form-control-custom.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important;
  }
  
  .section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .btn-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s ease-in-out;
  }
  
  .btn-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.4);
  }
  
  .btn-warning-custom {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border: none;
    transition: all 0.3s ease-in-out;
  }
  
  .btn-warning-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(240, 147, 251, 0.4);
  }
  
  .icon-container {
    transition: all 0.3s ease-in-out;
  }
  
  .icon-container:hover {
    transform: scale(1.1);
  }
  
  .alert-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
  }
  
  .card-header-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
`;

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
    formState: { errors, isSubmitting, isDirty }
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
    <>
      <style>{customStyles}</style>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Card className="settings-form-card border-0 rounded-3 overflow-hidden fade-in-up">
            <Card.Body className="p-4">
              {/* Section Informations générales */}
              <div className="mb-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <FontAwesomeIcon icon={faStore} className="text-primary me-2" />
                        Nom de la boutique
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le nom de votre boutique"
                        isInvalid={!!errors.shopName}
                        className="form-control-custom rounded-3"
                        {...register('shopName')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.shopName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Logo de la boutique
                      </Form.Label>
                      <Row className="g-2">
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
                            <Card className="shadow-sm border-0 rounded-3">
                              <Card.Body className="p-2 text-center">
                                <Image
                                  src={currentImage.url}
                                  alt="Logo Preview"
                                  style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                  onError={e => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <small className="text-muted d-block mt-2">
                                  Aperçu du logo
                                </small>
                              </Card.Body>
                            </Card>
                          )}
                        </Col>
                      </Row>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <hr className="my-4" />

              {/* Section Informations de contact */}
              <div className="mb-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="text-info me-2" />
                        Adresse e-mail
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="exemple@boutique.com"
                        isInvalid={!!errors.email}
                        className="form-control-custom rounded-3"
                        {...register('email')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold d-flex align-items-center">
                        <FontAwesomeIcon icon={faPhone} className="text-success me-2" />
                        Numéro de téléphone
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="+1234567890"
                        isInvalid={!!errors.phone}
                        className="form-control-custom rounded-3"
                        {...register('phone')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <hr className="my-4" />

              {/* Section Adresse */}
              <div className="mb-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded me-2 icon-container">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-warning" />
                  </div>
                  <h6 className="fw-bold mb-0 section-header">
                    Adresse de la boutique
                  </h6>
                </div>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Pays
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le pays"
                        isInvalid={!!errors.country}
                        className="form-control-custom rounded-3"
                        {...register('country')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.country?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Région
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez la région"
                        isInvalid={!!errors.region}
                        className="form-control-custom rounded-3"
                        {...register('region')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.region?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Département
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le département"
                        isInvalid={!!errors.department}
                        className="form-control-custom rounded-3"
                        {...register('department')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.department?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Quartier
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le quartier"
                        isInvalid={!!errors.neighborhood}
                        className="form-control-custom rounded-3"
                        {...register('neighborhood')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.neighborhood?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Rue
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez la rue"
                        isInvalid={!!errors.street}
                        className="form-control-custom rounded-3"
                        {...register('street')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.street?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Alert d'information */}
              <Alert variant="info" className="alert-custom border-0 rounded-3 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <div>
                    <strong>Information :</strong> Tous les champs marqués avec un astérisque (*) sont obligatoires. 
                    Les autres champs sont optionnels et peuvent être remplis plus tard.
                  </div>
                </div>
              </Alert>

              {/* Boutons d'action */}
              <div className="d-flex justify-content-center mt-4 fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Button
                  variant={isEditMode || initialValues?.id ? 'warning' : 'primary'}
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-3 fw-semibold ${
                    isEditMode || initialValues?.id ? 'btn-warning-custom' : 'btn-custom'
                  }`}
                  style={{ 
                    minWidth: '150px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon 
                        icon={isEditMode || initialValues?.id ? faEdit : faSave} 
                        className="me-2" 
                      />
                      {isEditMode || initialValues?.id ? 'Modifier' : 'Enregistrer'}
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </form>
      </FormProvider>
    </>
  );
};

ShopSettingsForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool
};

export default React.memo(ShopSettingsForm);
