import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, Button } from 'react-bootstrap';

const currency = n => `${(n || 0).toLocaleString('fr-FR')} XOF`;

const InvoicePreview = ({
  company,
  saleData,
  items = [],
  customerInfo = {},
  onPrint
}) => {
  const today = useMemo(
    () => format(new Date(), 'dd/MM/yyyy', { locale: fr }),
    []
  );
  const total = useMemo(
    () =>
      items.reduce((acc, it) => {
        const unit =
          it.prixVente ||
          Math.floor((it.totalPrice || 0) / (it.quantity || 1)) ||
          0;
        const qty = it.quantity || it.quantiteVendu || 1;
        return acc + unit * qty;
      }, 0),
    [items]
  );

  return (
    <div className="p-3">
      <div
        className="brand-bar rounded p-3 mb-3 d-flex justify-content-between align-items-center"
        style={{ background: '#1a237e', color: '#fff' }}
      >
        <div className="d-flex align-items-center">
          {company?.logo && (
            <img
              src={company.logo}
              alt="logo"
              style={{ height: 34 }}
              className="me-2"
            />
          )}
          <h5 className="m-0">{company?.name || 'Boutique'}</h5>
        </div>
        <h4 className="m-0">FACTURE</h4>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-8">
          <Card className="border-primary">
            <Card.Body className="py-2">
              <div>{company?.address}</div>
              <div>{company?.neighborhood}</div>
              <div>Tél: {company?.phone}</div>
              <div>Email: {company?.email}</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12 col-md-4">
          <Card className="border-primary">
            <Card.Header className="py-1 text-center fw-bold bg-primary text-white">
              DÉTAILS
            </Card.Header>
            <Card.Body className="py-2">
              <div>Date: {today}</div>
              <div>N°: {customerInfo?.id || ''}</div>
              <div>Client: {customerInfo?.phoneNumber || 'Non spécifié'}</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <Card className="border-primary">
            <Card.Header className="py-1 fw-bold">FACTURÉ À</Card.Header>
            <Card.Body className="py-2">
              <div>{customerInfo?.fullName || 'Client'}</div>
              {customerInfo?.phoneNumber && (
                <div>{customerInfo.phoneNumber}</div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="mb-2 fw-semibold">Informations de paiement</div>
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          Mode: {(saleData?.modePaiement || '').toUpperCase()}
        </div>
        <div className="col-12 col-md-6 text-md-end">Date: {today}</div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead className="table-primary">
            <tr>
              <th className="text-center" style={{ width: '6%' }}>
                N°
              </th>
              <th>Description du produit</th>
              <th className="text-center" style={{ width: '12%' }}>
                Qté
              </th>
              <th className="text-end" style={{ width: '18%' }}>
                Prix unitaire
              </th>
              <th className="text-end" style={{ width: '18%' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const unit =
                it.prixVente ||
                Math.floor((it.totalPrice || 0) / (it.quantity || 1)) ||
                0;
              const qty = it.quantity || it.quantiteVendu || 1;
              const line = unit * qty;
              return (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td>{it.libelle || 'Produit'}</td>
                  <td className="text-center">{qty}</td>
                  <td className="text-end">{currency(unit)}</td>
                  <td className="text-end fw-semibold">{currency(line)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end my-4">
        <Card style={{ minWidth: 320, border: '2px solid #3490dc' }}>
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div className="fw-bold text-primary">TOTAL À PAYER:</div>
            <div className="fs-4 fw-bold text-success">{currency(total)}</div>
          </Card.Body>
        </Card>
      </div>

      <div className="mt-2 small text-muted">
        {[company?.country, company?.region, company?.neighborhood]
          .filter(Boolean)
          .join('-')}
        {company?.address ? ` Rue: ${company.address}` : ''}
        {company?.phone ? ` Tél: ${company.phone}` : ''}
        {company?.email ? ` Email: ${company.email}` : ''}
      </div>

      <div className="text-end mt-3">
        <Button variant="primary" onClick={onPrint}>
          Imprimer
        </Button>
      </div>
    </div>
  );
};

export default InvoicePreview;
