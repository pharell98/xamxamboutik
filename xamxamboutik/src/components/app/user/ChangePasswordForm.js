import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useToast } from '../../common/Toast';
import WizardInput from './WizardInput';
import userServiceV1 from 'services/user.service.v1';
import PropTypes from 'prop-types';

const ChangePasswordForm = ({ user = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();
  const { addToast } = useToast();

  const onSubmit = async data => {
    if (!user?.id) {
      addToast({
        title: 'Erreur',
        message: 'Aucun utilisateur sélectionné.',
        type: 'error'
      });
      return;
    }
    try {
      // Log du mot de passe saisi pour débogage
      console.log('Mot de passe saisi pour modification:', {
        newPassword: data.newPassword,
        passwordLength: data.newPassword.length,
        passwordChars: data.newPassword.split('').map(c => c.charCodeAt(0))
      });
      await userServiceV1.updatePassword(user.id, data.newPassword);
      addToast({
        title: 'Succès',
        message: `Mot de passe mis à jour pour "${user.nom}".`,
        type: 'success'
      });
      reset();
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || 'Erreur lors de la mise à jour.';
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
          Changer le mot de passe {user ? `pour ${user.nom}` : ''}
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <WizardInput
            type="password"
            label="Nouveau mot de passe*"
            name="newPassword"
            errors={errors}
            formGroupProps={{ className: 'mb-3' }}
            formControlProps={{
              ...register('newPassword', {
                required: 'Le nouveau mot de passe est obligatoire',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit avoir au moins 6 caractères'
                }
              })
            }}
          />
          <WizardInput
            type="password"
            label="Confirmer le mot de passe*"
            name="confirmPassword"
            errors={errors}
            formGroupProps={{ className: 'mb-3' }}
            formControlProps={{
              ...register('confirmPassword', {
                required: 'La confirmation du mot de passe est obligatoire',
                validate: value =>
                  value === watch('newPassword') ||
                  'Les mots de passe ne correspondent pas'
              })
            }}
          />
          <Row>
            <Col className="text-end">
              <Button
                variant="primary"
                className="mt-3 px-5"
                type="submit"
                disabled={!user}
              >
                Mettre à jour le mot de passe
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

ChangePasswordForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    nom: PropTypes.string
  })
};

export default ChangePasswordForm;
