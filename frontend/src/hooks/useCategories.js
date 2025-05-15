import { useState, useEffect, useCallback } from 'react';
import apiServiceV1 from 'services/api.service.v1';
import { useToast } from 'components/common/Toast';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editModeCategory, setEditModeCategory] = useState(false);
  const { addToast } = useToast();

  const loadAllCategories = useCallback(async () => {
    try {
      const response = await apiServiceV1.getAllCategories(1, 100);
      setCategories(response.data?.content || []);
    } catch (error) {
      addToast({
        title: 'Erreur',
        message:
          error.response?.data?.message ||
          'Impossible de charger les catégories.',
        type: 'error'
      });
      console.error(
        '[useCategories] Erreur lors du chargement des catégories:',
        error
      );
    }
  }, [addToast]);

  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);

  const handleSaveCategory = async formValues => {
    try {
      const newCategory = formValues.libelle.trim();
      if (!newCategory) return;

      const response = await apiServiceV1.saveCategory({
        id: selectedCategory?.id || null,
        libelle: newCategory
      });
      // On suppose que l'API renvoie la catégorie créée ou mise à jour dans response.data
      const createdOrUpdated = response.data || response;
      setCategories(prev =>
        selectedCategory
          ? prev.map(cat =>
              cat.id === selectedCategory.id
                ? { ...cat, libelle: createdOrUpdated.libelle }
                : cat
            )
          : [...prev, createdOrUpdated]
      );

      addToast({
        title: 'Succès',
        message: `Catégorie ${
          selectedCategory ? 'mise à jour' : 'ajoutée'
        } : "${createdOrUpdated.libelle || newCategory}"`,
        type: 'success'
      });

      setSelectedCategory(null);
      setEditModeCategory(false);
    } catch (error) {
      console.error(
        '[useCategories] Erreur lors de la sauvegarde de la catégorie:',
        error
      );
      const serverMessage =
        error.response?.data?.message ||
        'Impossible de créer ou mettre à jour la catégorie.';
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
