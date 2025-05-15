import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Users from './users';
import AddUserForm from './AddUserForm';
import ChangePasswordForm from './ChangePasswordForm';
import PageHeader from '../../common/PageHeader';

const UserPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = user => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleFormSubmit = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleFormCancel = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  return (
    <Row className="g-3">
      <PageHeader title="Utilisateur" titleTag="h5" className="mb-3" />
      <Col md={4}>
        <div className="mb-3">
          <AddUserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEditing={isEditing}
          />
        </div>
        <ChangePasswordForm user={selectedUser} />
      </Col>
      <Col md={8}>
        <Users onEdit={handleEdit} isEditing={isEditing} />
      </Col>
    </Row>
  );
};

export default UserPage;
