import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useToast } from '../../common/Toast';
import WizardInput from './WizardInput';
import userServiceV1 from 'services/user.service.v1';
import PropTypes from 'prop-types';

const AddUserForm = ({
  user = null,
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();
  const { addToast } = useToast();
  const [roleOptions, setRoleOptions] = useState([]);

  // Charger les rôles dynamiquement
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await userServiceV1.getRoles();
        const roles = response.data || [];
        setRoleOptions(roles);
      } catch (error) {
        console.error(
          '[AddUserForm] Erreur lors de la récupération des rôles:',
          error
        );
        addToast({
          title: 'Erreur',
          message: 'Erreur lors du chargement des rôles.',
          type: 'error'
        });
        setRoleOptions(['GESTIONNAIRE', 'VENDEUR']); // Fallback
      }
    };
    fetchRoles();
  }, [addToast]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (isEditing && user) {
      reset({
        nom: user.nom || '',
        login: user.login || '',
        role: user.role || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      reset({
        nom: '',
        login: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, isEditing, reset]);

  const onFormSubmit = async data => {
    try {
      if (isEditing && user?.id) {
        await userServiceV1.updateUser(user.id, {
          nom: data.nom,
          login: data.login,
          role: data.role
        });
        addToast({
          title: 'Succès',
          message: `Utilisateur "${data.nom}" mis à jour.`,
          type: 'success'
        });
      } else {
        await userServiceV1.saveUser({
          nom: data.nom,
          login: data.login,
          password: data.password,
          role: data.role
        });
        addToast({
          title: 'Succès',
          message: `Utilisateur "${data.nom}" ajouté.`,
          type: 'success'
        });
      }
      reset({
        nom: '',
        login: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
      onSubmit();
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || 'Erreur lors de l’enregistrement.';
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
  };

  return (
    <Card>
      <Card.Header className="bg-body-tertiary">
        <h5 className="mb-0">
          {isEditing ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <WizardInput
            label="Nom*"
            name="nom"
            errors={errors}
            formGroupProps={{ className: 'mb-3' }}
            formControlProps={{
              ...register('nom', {
                required: 'Le nom est obligatoire'
              })
            }}
          />
          <WizardInput
            label="Login*"
            name="login"
            errors={errors}
            formGroupProps={{ className: 'mb-3' }}
            formControlProps={{
              ...register('login', {
                required: 'Le login est obligatoire'
              })
            }}
          />
          {!isEditing && (
            <Row className="g-2 mb-3">
              <WizardInput
                type="password"
                label="Mot de passe*"
                name="password"
                errors={errors}
                formGroupProps={{ as: Col, sm: 6 }}
                formControlProps={{
                  ...register('password', {
                    required: 'Le mot de passe est obligatoire',
                    minLength: {
                      value: 6,
                      message:
                        'Le mot de passe doit avoir au moins 6 caractères'
                    }
                  })
                }}
              />
              <WizardInput
                type="password"
                label="Confirmer le mot de passe*"
                name="confirmPassword"
                errors={errors}
                formGroupProps={{ as: Col, sm: 6 }}
                formControlProps={{
                  ...register('confirmPassword', {
                    required: 'La confirmation du mot de passe est obligatoire',
                    validate: value =>
                      value === watch('password') ||
                      'Les mots de passe ne correspondent pas'
                  })
                }}
              />
            </Row>
          )}
          <WizardInput
            type="select"
            label="Rôle*"
            name="role"
            errors={errors}
            options={roleOptions}
            placeholder="Sélectionner un rôle"
            formGroupProps={{ className: 'mb-3' }}
            formControlProps={{
              ...register('role', {
                required: 'Le rôle est obligatoire'
              })
            }}
          />
          <Row>
            <Col className="text-end">
              {isEditing && (
                <Button
                  variant="secondary"
                  className="mt-3 me-2"
                  onClick={onCancel}
                >
                  Annuler
                </Button>
              )}
              <Button
                variant={isEditing ? 'primary' : 'success'}
                className="mt-3 px-5"
                type="submit"
              >
                {isEditing ? 'Mettre à jour' : "Ajouter l'Utilisateur"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

AddUserForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    nom: PropTypes.string,
    login: PropTypes.string,
    role: PropTypes.string
  }),
  isEditing: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default AddUserForm;
