import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import paths from 'routes/paths';
import { useToast } from '../common/Toast';
import { authService } from '../../services/auth.service';
import localForage from 'localforage';

const LoginForm = ({ hasLabel = false }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await authService.login(formData.login, formData.password);
      const decodedToken = jwtDecode(data.access_token);
      const roles =
        typeof decodedToken.roles === 'string'
          ? decodedToken.roles.split(',')
          : [decodedToken.roles];
      await localForage.setItem('accessToken', data.access_token);
      await localForage.setItem('refreshToken', data.refresh_token);
      await localForage.setItem('userRoles', roles);
      addToast({
        title: 'Connexion réussie',
        message: `Bienvenu ${data.user_info.username}`,
        type: 'success',
        duration: 7000
      });
      navigate(paths.products('product-grid'));
    } catch (error) {
      console.error(
        'Erreur de connexion:',
        error.response ? error.response.data : error
      );
      let errorMessage;
      if (!error.response) {
        errorMessage = 'Le backend ne répond pas';
      } else if (error.response.status === 401) {
        errorMessage = 'Login ou mot de passe incorrect';
      } else {
        errorMessage = 'Login ou mot de passe incorrect';
      }
      addToast({
        title: 'Erreur de connexion',
        message: errorMessage,
        type: 'error',
        duration: 7000
      });
    }
  };

  const handleFieldChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Login</Form.Label>}
        <Form.Control
          placeholder={!hasLabel ? 'Login' : ''}
          value={formData.login}
          name="login"
          onChange={handleFieldChange}
          type="text"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        {hasLabel && <Form.Label>Password</Form.Label>}
        <InputGroup>
          <Form.Control
            placeholder={!hasLabel ? 'Password' : ''}
            value={formData.password}
            name="password"
            onChange={handleFieldChange}
            type={showPassword ? 'text' : 'password'}
          />
          <InputGroup.Text
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </InputGroup.Text>
        </InputGroup>
      </Form.Group>

      <Form.Group>
        <Button
          type="submit"
          color="primary"
          className="mt-3 w-100"
          disabled={!formData.login || !formData.password}
        >
          Se connecter
        </Button>
      </Form.Group>
    </Form>
  );
};

LoginForm.propTypes = {
  layout: PropTypes.string,
  hasLabel: PropTypes.bool
};

export default LoginForm;
