import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import localForage from 'localforage';
import team3 from 'assets/img/team/3.jpg';
import Avatar from 'components/common/Avatar';
import paths from 'routes/paths';
import { authService } from 'services/auth.service';

const ProfileDropdown = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect((token, options) => {
    const fetchUserName = async () => {
      try {
        const token = await localForage.getItem('accessToken');
        if (token) {
          const decoded = jwtDecode(token, options);
          setUserName(decoded.nom);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token', error);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate(paths.cardLogin);
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return (
    <Dropdown navbar as="li">
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        to="#!"
        className="pe-0 ps-2 nav-link"
      >
        <Avatar src={team3} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-caret dropdown-menu-card dropdown-menu-end">
        <div className="bg-white rounded-2 py-2 dark__bg-1000">
          <Dropdown.Item className="fw-bold text-warning" href="#!">
            <FontAwesomeIcon icon="user" className="me-1" />
            {/* Afficher le nom de l'utilisateur connecté depuis le token */}
            <span>{userName || 'Utilisateur'}</span>
          </Dropdown.Item>
          <Dropdown.Divider />
          {/*
          <Dropdown.Item as={Link} to={paths.userProfile}>
            Mon profil
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to={paths.userSettings}>
            Settings
          </Dropdown.Item>
          */}
          <Dropdown.Item onClick={handleLogout}>Déconnexion</Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
