// Importation des dépendances nécessaires
import React, { forwardRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'react-bootstrap';
import Background from 'components/common/Background'; // Composant pour l'image de fond
import Flex from 'components/common/Flex'; // Composant pour la mise en page flexible
import ecomBg from 'assets/img/illustrations/ecommerce-bg.png'; // Image de fond
import DatePicker from 'react-datepicker'; // Composant de sélection de date
import 'react-datepicker/dist/react-datepicker.css'; // Styles pour DatePicker
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Icônes FontAwesome
import { faCalendar, faTimes } from '@fortawesome/free-solid-svg-icons'; // Icônes spécifiques
import dashboardService from 'services/dashboardService'; // Service pour les appels API

// Composant CustomInput pour personnaliser l'entrée du DatePicker
const CustomInput = forwardRef(
  ({ value, onClick = () => {}, placeholder }, ref) => (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Input stylisé avec icône de calendrier */}
      <input
        style={{
          height: '38px',
          fontSize: '14px',
          border: '1px solid #e0e4e9',
          borderRadius: '8px',
          padding: '8px 40px 8px 12px',
          width: '100%',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        className="form-control shadow-none"
        onClick={onClick}
        ref={ref}
        value={value || ''}
        placeholder={placeholder}
        readOnly
        onFocus={e => {
          e.target.style.borderColor = '#007bff';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.2)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#e0e4e9';
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        }}
      />
      <FontAwesomeIcon
        icon={faCalendar}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#6c757d',
          fontSize: '14px'
        }}
      />
    </div>
  )
);

// Validation des props pour CustomInput
CustomInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  placeholder: PropTypes.string
};

// Composant principal BeneficeCard
const BeneficeCard = ({ revenueData, notifications }) => {
  // États pour gérer les dates et le bénéfice filtré
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  // Fonction pour extraire le bénéfice des données API
  const extractBenefit = result => {
    if (result && result.data) {
      if (result.data.benefit !== undefined) return result.data.benefit;
      if (result.data.data && result.data.data.benefit !== undefined)
        return result.data.data.benefit;
    }
    return 0;
  };

  // Effet pour charger les données initiales (bénéfice et plage de dates)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Récupération du bénéfice cumulatif
      try {
        const benefitResult = await dashboardService.getCumulativeBenefit();
        setFilteredRevenue(extractBenefit(benefitResult));
      } catch (error) {
        console.error(
          'Erreur lors de la récupération du bénéfice cumulatif:',
          error
        );
        setFilteredRevenue(0);
      }

      // Récupération de la plage de dates des ventes
      try {
        const dateRangeResult = await dashboardService.getSalesDateRange();
        console.log('Réponse getSalesDateRange:', dateRangeResult);
        if (dateRangeResult.success && dateRangeResult.data) {
          const firstSaleDate = new Date(dateRangeResult.data.firstSaleDate);
          const lastSaleDate = new Date(dateRangeResult.data.lastSaleDate);
          console.log(
            'firstSaleDate:',
            firstSaleDate,
            'lastSaleDate:',
            lastSaleDate,
            'firstSaleDate valid:',
            !isNaN(firstSaleDate.getTime()),
            'lastSaleDate valid:',
            !isNaN(lastSaleDate.getTime())
          );
          if (
            !isNaN(firstSaleDate.getTime()) &&
            !isNaN(lastSaleDate.getTime())
          ) {
            setMinDate(firstSaleDate);
            setMaxDate(lastSaleDate);
          } else {
            console.error('Dates invalides reçues:', dateRangeResult.data);
            setMinDate(new Date('2025-01-01'));
            setMaxDate(new Date());
          }
        } else {
          console.error('Aucune donnée de date reçue:', dateRangeResult);
          setMinDate(new Date('2025-01-01'));
          setMaxDate(new Date());
        }
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des dates des ventes:',
          error
        );
        setMinDate(new Date('2025-01-01'));
        setMaxDate(new Date());
      }
    };
    fetchInitialData();
  }, []);

  // Formatage de la date au format yyyy-MM-dd
  const formatDate = date => (date ? date.toISOString().split('T')[0] : null);

  // Filtrage du bénéfice pour une période donnée
  const handleFilter = async () => {
    if (startDate && endDate) {
      try {
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);
        const result = await dashboardService.getBenefitBetweenDates(
          startDateFormatted,
          endDateFormatted
        );
        setFilteredRevenue(extractBenefit(result));
      } catch (error) {
        console.error('Erreur lors de la récupération du bénéfice:', error);
      }
    }
  };

  // Réinitialisation des filtres et rechargement du bénéfice cumulatif
  const handleResetFilter = async () => {
    setStartDate(null);
    setEndDate(null);
    try {
      const result = await dashboardService.getCumulativeBenefit();
      setFilteredRevenue(extractBenefit(result));
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du bénéfice:', error);
    }
  };

  // Style pour les conteneurs des DatePickers (largeur augmentée pour visibilité)
  const containerStyle = {
    width: '200px', // Augmenté de 220px à 250px pour plus d'espace
    marginBottom: '20px', // Plus d'espace vertical
    marginRight: '1px' // Espacement horizontal pour éviter les collisions
  };

  return (
    <Card className="bg-transparent-50">
      <Card.Header className="position-relative">
        {/* Image de fond maintenue en arrière-plan */}
        <Background
          image={ecomBg}
          className="d-none d-md-block bg-card z-1"
          style={{
            backgroundSize: '230px',
            backgroundPosition: 'right bottom',
            zIndex: '-1', // Toujours en arrière-plan
            pointerEvents: 'none'
          }}
        />
        <div className="position-relative z-index-2">
          {/* Titre principal */}
          <h3 className="text-primary mb-4">Hello, Darou Salam Shop!</h3>
          {/* Conteneur flex pour les DatePickers et boutons avec espacement accru */}
          <div
            className="d-flex flex-wrap align-items-center gap-3"
            style={{ minHeight: '80px' }} // Hauteur minimale pour éviter l'écrasement
          >
            {/* DatePicker pour la date de début */}
            <div style={containerStyle}>
              <DatePicker
                selected={startDate}
                onChange={date => {
                  console.log('Date de début sélectionnée:', date);
                  setStartDate(date);
                  // Si la date de fin est antérieure à la nouvelle date de début, la réinitialiser
                  if (endDate && date && endDate < date) {
                    setEndDate(null);
                  }
                }}
                placeholderText="Date de début"
                dateFormat="yyyy-MM-dd"
                customInput={<CustomInput placeholder="Date de début" />}
                minDate={minDate}
                maxDate={maxDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperClassName="custom-datepicker-popper"
              />
            </div>
            {/* DatePicker pour la date de fin */}
            <div style={containerStyle}>
              <DatePicker
                selected={endDate}
                onChange={date => {
                  console.log('Date de fin sélectionnée:', date);
                  setEndDate(date);
                }}
                placeholderText="Date de fin"
                dateFormat="yyyy-MM-dd"
                customInput={<CustomInput placeholder="Date de fin" />}
                minDate={startDate || minDate}
                maxDate={maxDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperClassName="custom-datepicker-popper"
              />
            </div>
            {/* Boutons de filtrage */}
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleFilter}
                style={{
                  marginBottom: '20px',
                  borderRadius: '8px',
                  padding: '8px 16px'
                }}
              >
                Filtrer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetFilter}
                title="Annuler le filtrage"
                style={{
                  marginBottom: '20px',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>
          </div>
          {/* Affichage du chiffre d'affaires */}
          <Flex className="py-3">
            <div className="pe-3">
              <p className="text-600 fs-12 fw-black">Chiffre d’affaires</p>
              <h4 className="text-800 mb-0">
                {typeof filteredRevenue === 'number'
                  ? filteredRevenue.toLocaleString() + ' CFA'
                  : 'Chargement...'}
              </h4>
            </div>
          </Flex>
        </div>
      </Card.Header>
    </Card>
  );
};

// Validation des props pour BeneficeCard
BeneficeCard.propTypes = {
  revenueData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ),
  notifications: PropTypes.array
};

export default BeneficeCard;
