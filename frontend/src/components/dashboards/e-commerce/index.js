import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import EcomStat from './EcomStat';
import BeneficeCard from './benefices/BeneficeCard';
import TotalSales from './totalsales/TotalSales';
import {
  marketShare,
  notifications,
  totalSale
} from 'data/dashboard/ecom';
import MarketShare from 'components/dashboards/default/MarketShare';
import caisseService from 'services/api.caisse.service';
import Loading from 'components/common/Loading';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';

const Ecommerce = () => {
  const [caisseStats, setCaisseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fermetureLoading, setFermetureLoading] = useState(false);
  const [estOuverte, setEstOuverte] = useState(undefined);

  const loadEtat = async () => {
      try {
        const [etat, ouverture] = await Promise.all([
          caisseService.getEtat(),
          caisseService.isOuverte()
        ]);
        setEstOuverte(Boolean(ouverture?.estOuverte));
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

        // Map API fields to dashboard KPIs (ordered as requested)
        const items = [
          {
            title: 'Montant initial',
            amount: formatAmount(pick(etat, ['montantInitial'])),
            className: 'border-200 border-bottom border-end pb-4'
          },
          {
            title: 'Ventes du jour',
            amount: formatAmount(pick(etat, ['ventesDuJour'])),
            className:
              'border-200 border-md-200 border-bottom border-md-end pb-4 ps-3'
          },
          {
            title: 'Pertes du jour',
            amount: formatAmount(pick(etat, ['pertesDuJour'])),
            className:
              'border-200 border-bottom border-end border-md-end-0 pb-4 pt-4 pt-md-0 ps-md-3'
          },
          {
            title: 'Montant total caisse (réel)',
            amount: formatAmount(pick(etat, ['montantTotalCaisseReel'])),
            className:
              'border-200 border-md-bottom-0 border-end pt-4 pb-md-0 ps-md-3'
          },
          {
            title: 'Montant fermeture',
            amount: formatAmount(pick(etat, ['montantFermeture'])),
            subAmount: etat?.status || undefined,
            className:
              'border-200 border-md-200 border-bottom border-md-bottom-0 border-md-end pt-4 pb-md-0 ps-3 ps-md-0'
          }
        ];
        setCaisseStats(items);
      } catch (e) {
        setCaisseStats([]);
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

  const handleFermeture = async () => {
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
                    onClick={handleFermeture}
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
          <Row className="g-3">
            <Col xs={12}>
              <BeneficeCard notifications={notifications} />
            </Col>
            <Col lg={12}>
              <Row className="g-3">
                {/* <Col md={6}>
                  <MarketShare data={marketShare} radius={['100%', '80%']} />
                </Col>
                <Col md={6}>
                  <MarketShare data={marketShare} radius={['100%', '80%']} />
                </Col> */}
              </Row>
            </Col>
          </Row>
        </Col>
        <Col xxl={6} xl={12}>
          {loading ? (
            <Loading />
          ) : (
            <>
              <EcomStat data={caisseStats} />
            </>
          )}
          {/* <TotalSales data={totalSale} /> */}
        </Col>
      </Row>
    </>
  );
};

export default Ecommerce;
