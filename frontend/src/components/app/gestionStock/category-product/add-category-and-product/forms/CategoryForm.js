import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Button, Form, Row } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { categorySchema } from 'components/app/validatore/categorySchema';
import { FiX } from 'react-icons/fi';

const defaultInitialValues = {
  libelle: '',
  id: null
};

const CategoryForm = ({
  onSubmit,
  onUpdate,
  onCancel,
  initialValues = defaultInitialValues,
  isEditMode = false
}) => {
  const methods = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: initialValues
  });
  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
    watch
  } = methods;

  // On observe l'ID actuel dans le formulaire
  const currentFormId = watch('id');
  // On stocke la version stringifiée des initialValues
  const prevInitialValuesRef = useRef(JSON.stringify(initialValues));

  useEffect(() => {
    const currentInitialStr = JSON.stringify(initialValues);
    if (prevInitialValuesRef.current !== currentInitialStr) {
      // En mode modification, on réinitialise seulement si l'ID change
      // En mode ajout, on réinitialise systématiquement
      if (
        !isEditMode ||
        (initialValues.id && initialValues.id !== currentFormId)
      ) {
        reset(initialValues);
      }
      prevInitialValuesRef.current = currentInitialStr;
    }
  }, [initialValues, isEditMode, currentFormId, reset]);

  const handleFormSubmit = data => {
    if (isEditMode) {
      onUpdate(data);
    } else {
      onSubmit(data);
      // Après ajout, on vide le formulaire
      reset(defaultInitialValues);
    }
  };

  const buttonLabel = isEditMode
    ? 'Modifier la Catégorie'
    : 'Ajouter Catégorie';
  const buttonVariant = isEditMode ? 'warning' : 'primary';

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card className="mb-3">
          <Card.Header as="h6" className="bg-body-tertiary">
            {buttonLabel}
          </Card.Header>
          <Card.Body>
            <Row className="gx-2 gy-3">
              <Col md="12">
                <Form.Group>
                  <Form.Label>Libellé :</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Saisir le libellé de la catégorie"
                    {...register('libelle')}
                    isInvalid={!!errors.libelle}
                  />
                  {errors.libelle && (
                    <Form.Control.Feedback type="invalid">
                      {errors.libelle.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-3">
              <Button variant={buttonVariant} type="submit">
                {buttonLabel}
              </Button>
              {isEditMode && onCancel && (
                <Button
                  variant="danger"
                  onClick={onCancel}
                  className="ms-2"
                  title="Annuler la modification"
                >
                  <FiX size={20} />
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </form>
    </FormProvider>
  );
};

CategoryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  initialValues: PropTypes.shape({
    libelle: PropTypes.string,
    id: PropTypes.any
  }),
  isEditMode: PropTypes.bool
};

export default React.memo(CategoryForm);
