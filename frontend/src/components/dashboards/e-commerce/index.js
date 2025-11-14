import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EcomStat from './EcomStat';
import BeneficeCard from './benefices/BeneficeCard';
import PaymentModeChart from './PaymentModeChart';
import SalesEvolutionChart from './SalesEvolutionChart';
import StockAlertsWidget from './StockAlertsWidget';
import caisseService from 'services/api.caisse.service';
import dashboardService from 'services/dashboardService';
import Loading from 'components/common/Loading';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';
import ConfirmationModal from 'components/common/ConfirmationModal';
import { useAppContext } from 'providers/AppProvider';

const Ecommerce = () => {
  const {
    config: { isDark }
  } = useAppContext();

  // États existants
  const [caisseStats, setCaisseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fermetureLoading, setFermetureLoading] = useState(false);
  const [estOuverte, setEstOuverte] = useState(undefined);
  const [showConfirmFermeture, setShowConfirmFermeture] = useState(false);

  // Nouveaux états pour KPIs
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [salesEvolution, setSalesEvolution] = useState([]);
  const [stockAlerts, setStockAlerts] = useState({
    produitsEnRupture: 0,
    produitsAlerteCritique: 0
  });

  const loadEtat = async () => {
    try {
      // Charger toutes les données du dashboard en parallèle (4 appels optimisés)
      const [etat, ouverture, kpisComplementaires, paiements, evolution] =
        await Promise.all([
          caisseService.getEtat(),
          caisseService.isOuverte(),
          dashboardService.getKpisComplementaires('today'),
          dashboardService.getPaymentModeBreakdown('today'),
          dashboardService.getSalesEvolution(7)
        ]);

      setEstOuverte(Boolean(ouverture?.estOuverte));

      // Helpers
      const pick = (obj, keys = []) => {
        for (const key of keys) {
          if (obj && obj[key] !== undefined && obj[key] !== null) {
            return obj[key];
          }
        }
        return 0;
      };

      const formatAmount = value => {
        if (value === null || value === undefined) return '-';
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        try {
          return new Intl.NumberFormat('fr-FR').format(num);
        } catch {
          return String(num);
        }
      };

      // Extraire KPIs complémentaires
      const kpis = kpisComplementaires?.data || {};

      // Calculer le montant théorique de la caisse
      const montantInitial = pick(etat, ['montantInitial']) || 0;
      const ventesDuJour = pick(etat, ['ventesDuJour']) || 0;
      const pertesDuJour = pick(etat, ['pertesDuJour']) || 0;
      const montantTheorique = montantInitial + ventesDuJour - pertesDuJour;

      // Calculer total alertes stock
      const totalAlertes =
        (kpis.produitsEnRupture || 0) + (kpis.produitsAlerteCritique || 0);

      // Map API fields to dashboard KPIs (enrichi avec nouveaux KPIs)
      const items = [
        {
          title: 'Montant initial',
          amount: formatAmount(montantInitial),
          className: 'border-200 border-bottom border-end pb-3'
        },
        {
          title: 'Ventes du jour',
          amount: formatAmount(ventesDuJour),
          className:
            'border-200 border-md-200 border-bottom border-md-end pb-3 ps-3'
        },
        {
          title: 'Tickets (nb ventes)',
          amount: kpis.nombreVentes || 0,
          className: 'border-200 border-bottom border-end pb-3 pt-3 pt-md-0'
        },
        {
          title: 'Panier moyen',
          amount: formatAmount(kpis.panierMoyen),
          className:
            'border-200 border-md-bottom-0 border-end pt-3 pb-md-0 ps-3'
        },
        {
          title: 'Produits vendus',
          amount: kpis.produitsVendus || 0,
          className:
            'border-200 border-md-200 border-bottom border-md-bottom-0 border-md-end pt-3 pb-md-0'
        },
        {
          title: 'Montant théorique',
          amount: formatAmount(montantTheorique),
          subAmount: 'À encaisser',
          className: 'border-200 border-end pt-3 pb-3 pb-md-0 ps-3'
        }
      ];

      setCaisseStats(items);

      // Sauvegarder les données pour les graphiques
      setPaymentBreakdown(paiements?.data || []);
      setSalesEvolution(evolution?.data || []);
      setStockAlerts({
        produitsEnRupture: kpis.produitsEnRupture || 0,
        produitsAlerteCritique: kpis.produitsAlerteCritique || 0
      });
    } catch (e) {
      console.error('[Dashboard] Erreur lors du chargement des données:', e);
      setCaisseStats([]);
      setPaymentBreakdown([]);
      setSalesEvolution([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await caisseService.refreshVentesRealtime();
      await loadEtat();
    } finally {
      setRefreshing(false);
    }
  };

  // Ouvrir le modal de confirmation
  const handleOpenConfirmFermeture = () => {
    setShowConfirmFermeture(true);
  };

  // Annuler la fermeture
  const handleCancelFermeture = () => {
    setShowConfirmFermeture(false);
  };

  // Confirmer et fermer la boutique
  const handleConfirmFermeture = async () => {
    try {
      setFermetureLoading(true);
      const etat = await caisseService.fermerManuellement();
      await loadEtat();
      if (etat && typeof etat.estOuverte !== 'undefined') {
        setEstOuverte(Boolean(etat.estOuverte));
      } else {
        const ouverture = await caisseService.isOuverte();
        setEstOuverte(Boolean(ouverture?.estOuverte));
      }
      setShowConfirmFermeture(false); // Fermer le modal après succès
    } finally {
      setFermetureLoading(false);
    }
  };

  useEffect(() => {
    loadEtat();
  }, []);

  return (
    <>
      {/* Full-width caisse controls */}
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <Card>
            <Card.Header className="py-2">
              <Flex alignItems="center" justifyContent="between">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0">Caisse</h6>
                  {typeof estOuverte === 'undefined' ? (
                    <SubtleBadge bg="secondary">Chargement…</SubtleBadge>
                  ) : estOuverte ? (
                    <SubtleBadge bg="success">Ouverte</SubtleBadge>
                  ) : (
                    <SubtleBadge bg="danger">Fermée</SubtleBadge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-2"
                    title="Actualiser les ventes"
                  >
                    <FontAwesomeIcon icon="sync-alt" className="me-1" />
                    {refreshing ? 'Actualisation…' : 'Actualiser'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleOpenConfirmFermeture}
                    disabled={fermetureLoading || estOuverte === false}
                    className="px-2"
                    title="Fermer la caisse maintenant"
                  >
                    <FontAwesomeIcon icon="lock" className="me-1" />
                    {fermetureLoading ? 'Fermeture…' : 'Fermer'}
                  </Button>
                </div>
              </Flex>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      {/* Main dashboard content */}
      <Row className="g-3 mb-3">
        <Col xxl={6} xl={12}>
          <BeneficeCard />
        </Col>
        <Col xxl={6} xl={12}>
          {loading ? <Loading /> : <EcomStat data={caisseStats} />}
        </Col>
      </Row>

      {/* Row 2: Graphiques et alertes */}
      <Row className="g-3 mb-3">
        <Col lg={6}>
          <PaymentModeChart data={paymentBreakdown} loading={loading} />
        </Col>
        <Col lg={6}>
          <StockAlertsWidget alerts={stockAlerts} loading={loading} />
        </Col>
      </Row>

      {/* Row 3: Évolution des ventes sur 7 jours */}
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <SalesEvolutionChart data={salesEvolution} loading={loading} />
        </Col>
      </Row>

      {/* Modal de confirmation de fermeture */}
      <ConfirmationModal
        show={showConfirmFermeture}
        onHide={handleCancelFermeture}
        onConfirm={handleConfirmFermeture}
        title="Confirmer la fermeture de la boutique"
        message="Êtes-vous sûr de vouloir fermer la boutique maintenant ? Cette action clôturera la caisse du jour."
        confirmText="Oui, fermer la boutique"
        cancelText="Annuler"
        confirmVariant="danger"
        icon="exclamation-triangle"
        iconColor="warning"
        loading={fermetureLoading}
      />
    </>
  );
};

export default Ecommerce;
