import React from 'react';
import PropTypes from 'prop-types';
import CategoryForm from '../forms/CategoryForm';

const CategoryManagement = ({
  selectedCategory,
  editModeCategory,
  handleSaveCategory,
  setSelectedCategory,
  setEditModeCategory
}) => {
  const handleCancelCategoryEdit = () => {
    setSelectedCategory(null);
    setEditModeCategory(false);
  };

  const handleSubmit = data => {
    // Normalize libelle to lowercase before submitting
    handleSaveCategory({
      ...data,
      libelle: data.libelle?.trim().toLowerCase()
    });
  };

  return (
    <>
      <CategoryForm
        onSubmit={handleSubmit}
        onUpdate={handleSubmit}
        initialValues={
          selectedCategory
            ? { id: selectedCategory.id, libelle: selectedCategory.libelle }
            : { libelle: '' }
        }
        isEditMode={editModeCategory}
        onCancel={handleCancelCategoryEdit}
      />
    </>
  );
};

CategoryManagement.propTypes = {
  selectedCategory: PropTypes.shape({
    id: PropTypes.number,
    libelle: PropTypes.string
  }),
  editModeCategory: PropTypes.bool.isRequired,
  handleSaveCategory: PropTypes.func.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
  setEditModeCategory: PropTypes.func.isRequired
};

export default CategoryManagement;
