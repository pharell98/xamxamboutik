import React from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormGroup } from 'react-bootstrap';
import * as yup from 'yup';

// On définit un schéma de type "string",
// qui peut être vide OU une suite de chiffres (entier >= 0).
const feeSchema = yup.object().shape({
  transportFee: yup
    .string()
    .matches(
      /^[0-9]*$/,
      'Le frais de transport doit être un nombre entier positif (ou vide)'
    )
    .notRequired() // champ optionnel
});

const TransportFeeForm = ({ onFeeChange, initialFee }) => {
  const methods = useForm({
    resolver: yupResolver(feeSchema),
    defaultValues: {
      // On stocke la valeur initiale comme chaîne.
      // Si on reçoit un number, on le convertit en chaîne.
      transportFee: String(initialFee || '')
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  // Dès qu’on "blur" ou qu’on valide, on informe le parent
  const onSubmit = values => {
    // values.transportFee est une chaîne (ex: "123" ou "").
    // Si vous voulez la convertir en number, vous pouvez faire:
    // onFeeChange(values.transportFee ? Number(values.transportFee) : '');
    onFeeChange(values.transportFee);
  };

  return (
    <FormProvider {...methods}>
      {/* 
        - onBlur => permet de valider dès qu’on quitte le champ 
        - handleSubmit(onSubmit) => applique la validation Yup 
      */}
      <Form onBlur={handleSubmit(onSubmit)}>
        <FormGroup controlId="transportFee">
          <Form.Label>Frais de transport (Optionnel)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez les frais de transport (FCFA)"
            {...register('transportFee')}
            isInvalid={!!errors.transportFee}
          />
          <Form.Control.Feedback type="invalid">
            {errors.transportFee?.message}
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            Laissez vide si aucun frais de transport n'est appliqué
          </Form.Text>
        </FormGroup>
      </Form>
    </FormProvider>
  );
};

TransportFeeForm.propTypes = {
  onFeeChange: PropTypes.func.isRequired,
  // On autorise string OU number côté prop,
  // puis on convertit en chaîne si c’est un number.
  initialFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default TransportFeeForm;
