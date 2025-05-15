// useCalculateTotal.js
import { useEffect } from 'react';

export function useCalculateTotal({
  localFields,
  transportFee,
  setTotalAmount
}) {
  useEffect(() => {
    let total = 0;
    localFields.forEach(product => {
      const prixAchat = Number(product.prixAchat);
      const stockDisponible = Number(product.stockDisponible);
      if (
        !isNaN(prixAchat) &&
        prixAchat > 0 &&
        !isNaN(stockDisponible) &&
        stockDisponible > 0
      ) {
        total += prixAchat * stockDisponible;
      }
    });
    total += Number(transportFee) || 0;
    setTotalAmount(total);
  }, [localFields, transportFee, setTotalAmount]);
}
