import React from 'react';
import { Link } from 'react-router-dom';
import AuthCardLayout from 'layouts/AuthCardLayout';
import RegistrationForm from 'components/authentication/RegistrationForm';
import { Button } from 'react-bootstrap';
import paths from 'routes/paths';

const Registration = () => {
  return (
    <AuthCardLayout
      leftSideContent={
        <p className="pt-3 text-white">
          Have an account?
          <br />
          <Button
            as={Link}
            variant="outline-light"
            className="mt-2 px-4"
            to={paths.cardLogin}
          >
            Log In
          </Button>
        </p>
      }
      footer={false}
    >
      <h3>Register</h3>
      <RegistrationForm layout="card" hasLabel />
    </AuthCardLayout>
  );
};

export default Registration;
