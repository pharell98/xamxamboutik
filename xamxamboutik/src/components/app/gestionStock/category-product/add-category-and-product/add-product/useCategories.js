import { useEffect, useState } from 'react';
import apiServiceV1 from 'services/api.service.v1';
import { useToast } from 'components/common/Toast';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editModeCategory, setEditModeCategory] = useState(false);
  const { addToast } = useToast();

  // Fetch categories for the dropdown or other components
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiServiceV1.getAllCategories(1, 100);
        const cats = response.data.content || [];
        setCategories(cats);
      } catch (error) {
        console.error(
          '[useCategories] Erreur lors de la récupération des catégories:',
          error,
          'Response data:',
          error.response?.data
        );
        const serverMessage =
          error.response?.data?.message ||
          'Impossible de récupérer les catégories.';
        addToast({
          title: 'Erreur',
          message: serverMessage,
          type: 'error'
        });
      }
    };
    fetchCategories();
  }, [addToast]);

  // Handle saving or updating a category
  const handleSaveCategory = async categoryData => {
    try {
      // Ensure categoryData is properly formatted and normalized
      const payload = {
        id: editModeCategory ? selectedCategory?.id : undefined,
        libelle: categoryData.libelle?.trim().toLowerCase() // Normalize to lowercase
      };

      if (!payload.libelle) {
        throw new Error('Le libellé de la catégorie est requis.');
      }

      const response = await apiServiceV1.saveCategory(
        payload,
        editModeCategory
      );
      const createdOrUpdatedCategory = response.data || response;

      // Update local categories state to reflect changes
      setCategories(prev => {
        if (editModeCategory) {
          return prev.map(cat =>
            cat.id === createdOrUpdatedCategory.id
              ? createdOrUpdatedCategory
              : cat
          );
        }
        return [...prev, createdOrUpdatedCategory];
      });

      addToast({
        title: 'Succès',
        message: `Catégorie "${createdOrUpdatedCategory.libelle}" ${
          editModeCategory ? 'mise à jour' : 'créée'
        } avec succès.`,
        type: 'success'
      });
      setSelectedCategory(null);
      setEditModeCategory(false);
    } catch (error) {
      console.error(
        '[useCategories] Erreur lors de la sauvegarde:',
        error,
        'Response data:',
        error.response?.data
      );
      let serverMessage;
      // Check for duplicate entity error based on backend response
      if (
        error.response?.data?.code === 'DUPLICATE_ENTITY' ||
        error.response?.data?.message?.toLowerCase().includes('existe déjà') ||
        error.response?.data?.error?.toLowerCase().includes('existe déjà')
      ) {
        serverMessage = `La catégorie "${categoryData.libelle}" existe déjà.`;
      } else {
        serverMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Impossible de créer ou mettre à jour la catégorie.';
      }
      addToast({
        title: 'Erreur',
        message: serverMessage,
        type: 'error'
      });
    }
  };

  return {
    categories,
    selectedCategory,
    editModeCategory,
    setSelectedCategory,
    setEditModeCategory,
    handleSaveCategory
  };
};

export default useCategories;
