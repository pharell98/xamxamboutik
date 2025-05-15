import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from 'components/authentication/LoginForm';
import AuthCardLayout from 'layouts/AuthCardLayout';
import paths from 'routes/paths';

const Login = () => {
  return (
    <AuthCardLayout
      leftSideContent={
        <p className="text-white">
          Don't have an account?
          <br />
          <Link
            className="text-white text-decoration-underline"
            to={paths.cardRegister}
          >
            Get started!
          </Link>
        </p>
      }
    >
      <h3>Se connecter</h3>
      <LoginForm layout="card" hasLabel />
    </AuthCardLayout>
  );
};

export default Login;
