import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBan, FaExchangeAlt, FaUndo } from 'react-icons/fa';

function cellWrapperClass(/* sale */) {
  return 'py-2 d-flex align-items-center justify-content-center';
}

export const getSalesColumns = (
  onEdit,
  setShowActionForm,
  setSelectedSale,
  setSelectedAction
) => {
  return [
    {
      accessorKey: 'image',
      header: 'Image',
      meta: { headerProps: { className: 'text-center text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) {
          return (
            <div className="text-center w-100">
              Aucune vente effectuée pour cette date
            </div>
          );
        }
        const css = `text-center ${cellWrapperClass(row.original)}`;
        return (
          <div className={css}>
            {row.original.imageProduit ? (
              <img
                src={row.original.imageProduit}
                alt={row.original.libelleProduit || 'Vente'}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.transform = 'scale(1.05)')
                }
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ) : (
              '—'
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'libelle',
      header: 'Libelle',
      meta: { headerProps: { className: 'text-left text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-left fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        return (
          <div className={css}>
            {row.original.libelleProduit !== undefined
              ? row.original.libelleProduit
              : '—'}
          </div>
        );
      }
    },
    {
      accessorKey: 'prixVente',
      header: 'Prix Vente',
      meta: { headerProps: { className: 'text-right text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-right fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        const prix = row.original.prixVendu || row.original.prixVente;
        return (
          <div className={css}>{prix !== undefined ? prix + ' CFA' : '—'}</div>
        );
      }
    },
    {
      accessorKey: 'quantiteVendue',
      header: 'Quantité Vendue',
      meta: { headerProps: { className: 'text-right text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-right fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        const qty = row.original.quantiteVendu || row.original.quantiteVendue;
        return <div className={css}>{qty ?? '—'}</div>;
      }
    },
    {
      accessorKey: 'montantTotal',
      header: 'Montant Total',
      meta: { headerProps: { className: 'text-right text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-right fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        return (
          <div className={css}>
            {row.original.montantTotal !== undefined
              ? row.original.montantTotal + ' CFA'
              : '—'}
          </div>
        );
      }
    },
    {
      accessorKey: 'dateHeure',
      header: 'Date et Heure',
      meta: { headerProps: { className: 'text-left text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-left fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        return <div className={css}>{row.original.dateVente ?? '—'}</div>;
      }
    },
    {
      accessorKey: 'payement',
      header: 'Mode Paiement',
      meta: { headerProps: { className: 'text-left text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-left fs-9 fw-medium ${cellWrapperClass(
          row.original
        )}`;
        return <div className={css}>{row.original.modePaiement ?? '—'}</div>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { headerProps: { className: 'text-center text-900' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const css = `text-center ${cellWrapperClass(row.original)}`;
        const effectiveStatus = row.original.status || 'UNKNOWN';
        const statusStyles = {
          VENDU: { bg: '#d4edda', text: 'Vendu', icon: '✔' },
          RETOURNE_REMBOURSE: { bg: '#cce5ff', text: 'Remboursé', icon: '↩' },
          RETOURNE_ECHANGE: { bg: '#fff3cd', text: 'Échangé', icon: '↔' },
          ANNULE: { bg: '#f8d7da', text: 'Annulé', icon: '✖' },
          UNKNOWN: { bg: '#e9ecef', text: 'Inconnu', icon: '❓' }
        };
        const { bg, text, icon } =
          statusStyles[effectiveStatus] || statusStyles.UNKNOWN;
        return (
          <div className={css}>
            <span
              style={{
                backgroundColor: bg,
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={e =>
                (e.currentTarget.style.transform = 'scale(1.05)')
              }
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {text} <span>{icon}</span>
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { cellProps: { className: 'text-center' } },
      cell: ({ row }) => {
        if (row.original.empty) return '';
        const sale = row.original;
        const hasValidDetailVenteId = sale.detailVenteId != null;
        const isVendu = sale.status === 'VENDU';
        return (
          <div className="py-2 d-flex justify-content-center gap-2 align-items-center">
            {hasValidDetailVenteId && isVendu ? (
              <Dropdown>
                <Dropdown.Toggle
                  variant="primary"
                  size="sm"
                  aria-label="Sélectionner une action"
                  style={{
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>Remboursements</Dropdown.Header>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('remboursementBonEtat');
                      setShowActionForm(true);
                    }}
                  >
                    <FaUndo className="me-2" /> Remboursement - Bon état
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('remboursementDefectueux');
                      setShowActionForm(true);
                    }}
                  >
                    <FaUndo className="me-2" /> Remboursement - Défectueux
                  </Dropdown.Item>
                  <Dropdown.Header>Échanges</Dropdown.Header>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('echangeDefectueux');
                      setShowActionForm(true);
                    }}
                  >
                    <FaExchangeAlt className="me-2" /> Échange - Défectueux
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('echangeChangementPreference');
                      setShowActionForm(true);
                    }}
                  >
                    <FaExchangeAlt className="me-2" /> Échange - Préférence
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('echangeAjustementPrix');
                      setShowActionForm(true);
                    }}
                  >
                    <FaExchangeAlt className="me-2" /> Échange - Ajustement prix
                  </Dropdown.Item>
                  <Dropdown.Header>Annulations</Dropdown.Header>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('annulationApresLivraison');
                      setShowActionForm(true);
                    }}
                  >
                    <FaBan className="me-2" /> Annulation - Après livraison
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('annulationPartielle');
                      setShowActionForm(true);
                    }}
                  >
                    <FaBan className="me-2" /> Annulation - Partielle
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setSelectedSale({
                        detailVenteId: sale.detailVenteId,
                        quantiteVendu: sale.quantiteVendu,
                        status: sale.status
                      });
                      setSelectedAction('annulationNonConformite');
                      setShowActionForm(true);
                    }}
                  >
                    <FaBan className="me-2" /> Annulation - Non-conformité
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <span className="text-muted">Actions non disponibles</span>
            )}
          </div>
        );
      }
    }
  ];
};
