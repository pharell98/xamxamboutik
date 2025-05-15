// src/components/common/advance-table/AdvanceTablePagination.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import Flex from '../Flex';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';

/**
 * Constante représentant les points de suspension dans la pagination.
 */
const DOTS = '...';

/**
 * Hook qui calcule un tableau minimaliste de pages :
 * - Si `pageCount <= 3`, on affiche toutes les pages (0..pageCount-1).
 * - Sinon :
 *   - Si `currentPage < 3`, on affiche [0,1,2, DOTS, last].
 *   - Si `currentPage >= 3`, on affiche [0, DOTS, currentPage, DOTS, last]
 *     (en évitant les doublons si `currentPage === last`).
 */
function useSpecialPagination({ pageCount, currentPage }) {
  return React.useMemo(() => {
    // Cas 0 page ou 1 page
    if (pageCount <= 0) return [];
    if (pageCount === 1) return [0];

    // 2 pages => [0,1]
    if (pageCount === 2) {
      return [0, 1];
    }

    // 3 pages => [0,1,2]
    if (pageCount === 3) {
      return [0, 1, 2];
    }

    // Au-delà de 3 pages :
    const last = pageCount - 1;
    // On s'assure de ne pas dépasser la dernière page
    const c = Math.min(currentPage, last);

    // Si la page active est < 3 => [0,1,2, ..., last]
    if (c < 3) {
      return [0, 1, 2, DOTS, last];
    }

    // Sinon (c >= 3), on "cache" 2 et 3 derrière un DOTS
    // - si c == last => [0, '...', last]
    // - sinon => [0, '...', c, '...', last]
    if (c === last) {
      return [0, DOTS, last];
    }
    return [0, DOTS, c, DOTS, last];
  }, [pageCount, currentPage]);
}

export const AdvanceTablePagination = ({ totalAmount }) => {
  const {
    previousPage,
    nextPage,
    getCanNextPage,
    getCanPreviousPage,
    getState,
    getPageCount,
    setPageIndex,
    setPageSize
  } = useAdvanceTableContext();

  // Récupère la page courante et la taille de page
  const {
    pagination: { pageIndex, pageSize }
  } = getState();

  // Nombre total de pages
  const pageCount = getPageCount();

  // Calcul de la liste de pages à afficher
  const paginationRange = useSpecialPagination({
    pageCount,
    currentPage: pageIndex
  });

  // Options pour le "pageSize"
  const pageOptions = [5, 10, 15, 20];

  return (
    <Flex
      alignItems="center"
      justifyContent="between"
      style={{ width: '100%' }}
    >
      {/* BOUTON "PAGE PRÉCÉDENTE" ET LISTE DES PAGES */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          size="sm"
          variant="falcon-default"
          onClick={() => previousPage()}
          className={classNames({ disabled: !getCanPreviousPage() })}
        >
          <FontAwesomeIcon icon="chevron-left" />
        </Button>

        {/* LISTE DES PAGES (numéros + "...") */}
        <ul
          className="pagination mb-0 mx-2"
          style={{
            display: 'flex',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}
        >
          {paginationRange.map((page, index) => {
            if (page === DOTS) {
              // Affiche un bouton "..." désactivé
              return (
                <li key={index} style={{ marginRight: '0.5rem' }}>
                  <Button size="sm" variant="falcon-default" disabled>
                    ...
                  </Button>
                </li>
              );
            }
            // Sinon, c'est un numéro de page
            return (
              <li key={index} style={{ marginRight: '0.5rem' }}>
                <Button
                  size="sm"
                  variant="falcon-default"
                  className={classNames('page', {
                    active: pageIndex === page
                  })}
                  onClick={() => setPageIndex(page)}
                >
                  {/* +1 pour l'affichage "humain" (index 0 => "1") */}
                  {page + 1}
                </Button>
              </li>
            );
          })}
        </ul>

        {/* BOUTON "PAGE SUIVANTE" */}
        <Button
          size="sm"
          variant="falcon-default"
          onClick={() => nextPage()}
          className={classNames({ disabled: !getCanNextPage() })}
        >
          <FontAwesomeIcon icon="chevron-right" />
        </Button>
      </div>

      {/* SÉLECTEUR POUR LE NOMBRE DE LIGNES PAR PAGE ET TOTAL AMOUNT */}
      <Flex alignItems="center">
        <div style={{ marginRight: '1rem' }}>
          <Form.Select
            size="sm"
            style={{ width: '100px' }}
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            {pageOptions.map(option => (
              <option key={option} value={option}>
                {option} par page
              </option>
            ))}
          </Form.Select>
        </div>
        {totalAmount !== undefined && (
          <div className="text-primary fw-bold fs-9">
            MONTANT TOTAL: {totalAmount} CFA
          </div>
        )}
      </Flex>
    </Flex>
  );
};

export default AdvanceTablePagination;
