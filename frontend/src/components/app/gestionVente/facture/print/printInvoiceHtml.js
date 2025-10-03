import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiServiceSettings from '../../../../../services/api.service.settings';

const getCompany = async () => {
  try {
    const settings = await apiServiceSettings.getSettings();
    const computedLogo =
      settings && settings.logo
        ? typeof settings.logo === 'string'
          ? settings.logo
          : settings.logo.preview || null
        : null;
    return {
      name: settings.shopName || 'Boutique',
      logo: computedLogo,
      email: settings.email || '',
      phone: settings.phone || '',
      address: settings.street || '',
      neighborhood: settings.neighborhood || '',
      region: settings.region || '',
      country: settings.country || ''
    };
  } catch (e) {
    return {
      name: 'Boutique',
      logo: null,
      email: '',
      phone: '',
      address: '',
      neighborhood: '',
      region: '',
      country: ''
    };
  }
};

const currency = n => (n || 0).toLocaleString('fr-FR') + ' XOF';

export const printInvoice = async (
  saleData,
  items,
  customerInfo = {},
  userInfo = {}
) => {
  const company = await getCompany();
  const today = format(new Date(), 'dd/MM/yyyy', { locale: fr });

  const total = (items || []).reduce((acc, it) => {
    const unit =
      it.prixVente ||
      Math.floor((it.totalPrice || 0) / (it.quantity || 1)) ||
      0;
    const qty = it.quantity || it.quantiteVendu || 1;
    return acc + unit * qty;
  }, 0);

  const locationParts = [company.country, company.region, company.neighborhood]
    .filter(Boolean)
    .join('-');
  const footerLine = `${locationParts}${
    company.address ? ' Rue: ' + company.address : ''
  }${company.phone ? ' Tél: ' + company.phone : ''}${
    company.email ? ' Email: ' + company.email : ''
  }`.trim();

  const rows = (items || [])
    .map((it, idx) => {
      const unit =
        it.prixVente ||
        Math.floor((it.totalPrice || 0) / (it.quantity || 1)) ||
        0;
      const qty = it.quantity || it.quantiteVendu || 1;
      const line = unit * qty;
      return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${it.libelle || 'Produit'}</td>
          <td class="text-center">${qty}</td>
          <td class="text-end">${currency(unit)}</td>
          <td class="text-end fw-semibold">${currency(line)}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Facture</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
    <style>
      @page { size: A4; margin: 12mm; }
      html, body { height: 100%; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background:#fff; }
      .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; display:flex; flex-direction:column; }
      .brand-bar { color:#111; border-bottom:1px solid #e5e7eb; }
      .badge-title { background:transparent; color:#111; }
      .card-border { border:1px solid #e5e7eb; }
      .fs-4 { font-size: 1.25rem !important; }
      .invoice-footer { margin-top:auto; }
      .invoice-footer hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
      @media print { .no-print { display:none !important; } }
    </style>
  </head>
  <body class="p-4">
    <div class="a4">
      <div class="row align-items-center brand-bar px-3 py-2 mb-2">
        <div class="col d-flex align-items-center">
          ${
            company.logo
              ? `<img src="${company.logo}" alt="logo" class="me-2" style="height:34px"/>`
              : ''
          }
          <div>
            <h5 class="m-0">${company.name}</h5>
            <div class="small text-muted">${[
              company.phone ? `Tél: ${company.phone}` : '',
              company.email ? `Email: ${company.email}` : ''
            ]
              .filter(Boolean)
              .join(' · ')}</div>
          </div>
        </div>
        <div class="col text-end">
          <h5 class="m-0">FACTURE</h5>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-md-4 ms-auto">
          <div class="card card-border">
            <div class="card-header py-1 text-center fw-semibold">DÉTAILS</div>
            <div class="card-body py-2">
              <div>Date: ${today}</div>
              <div>N°: ${customerInfo.id || ''}</div>
              <div>Client: ${customerInfo.phoneNumber || 'Non spécifié'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-12 col-md-6">
          <div class="card card-border">
            <div class="card-header py-1 fw-bold">FACTURÉ À</div>
            <div class="card-body py-2">
              <div>${customerInfo.fullName || 'Client'}</div>
              ${
                customerInfo.phoneNumber
                  ? `<div>${customerInfo.phoneNumber}</div>`
                  : ''
              }
            </div>
          </div>
        </div>
      </div>

      <div class="mb-2 fw-semibold">Informations de paiement</div>
      <div class="row mb-2">
        <div class="col-12 col-md-6">Mode: ${String(
          saleData.modePaiement || ''
        ).toUpperCase()}</div>
        <div class="col-12 col-md-6 text-md-end">Date: ${today}</div>
      </div>

      <table class="table table-sm align-middle">
        <thead>
          <tr>
            <th class="text-center" style="width:6%">N°</th>
            <th>Description du produit</th>
            <th class="text-center" style="width:12%">Qté</th>
            <th class="text-end" style="width:18%">Prix unitaire</th>
            <th class="text-end" style="width:18%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="d-flex justify-content-end my-3">
        <div class="card" style="min-width: 300px; border:1px solid #e5e7eb">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div class="fw-semibold text-primary">TOTAL À PAYER</div>
            <div class="fw-bold text-success">${currency(total)}</div>
          </div>
        </div>
      </div>

      <!-- Section signatures retirée (demande utilisateur) -->

      <div class="invoice-footer text-center">
        <hr />
        <div class="text-secondary">Merci pour votre confiance et à bientôt !</div>
        <div class="small text-muted">${footerLine}</div>
      </div>

      <div class="text-center mt-3 no-print">
        <button class="btn btn-primary" onclick="window.print()">Imprimer</button>
      </div>
    </div>
  </body>
  </html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Lancer l'impression automatiquement après chargement
  w.onload = () => setTimeout(() => w.print(), 250);
};

export default printInvoice;
