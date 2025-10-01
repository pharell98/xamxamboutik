import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, Card, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import useResponsiveLayout from 'hooks/useResponsiveLayout';

/**
 * Table responsive intelligente avec adaptation automatique
 */
const ResponsiveTable = ({
  children,
  className = '',
  striped = true,
  hover = true,
  bordered = false,
  size = 'auto',
  variant = 'default',
  scrollable = true,
  compact = 'auto',
  ...props
}) => {
  const { isMobile, isTablet, isDesktop, layoutUtils } = useResponsiveLayout();

  // Configuration automatique selon l'appareil
  const tableConfig = useMemo(() => {
    const optimalConfig = layoutUtils.getOptimalConfig('table');

    return {
      size: size === 'auto' ? (isMobile ? 'sm' : isTablet ? 'sm' : '') : size,
      striped: striped,
      hover: hover && !isMobile, // Désactiver hover sur mobile
      bordered: bordered,
      responsive: scrollable,
      ...optimalConfig
    };
  }, [
    isMobile,
    isTablet,
    isDesktop,
    striped,
    hover,
    bordered,
    size,
    scrollable,
    layoutUtils
  ]);

  const tableClasses = classNames(
    'responsive-table',
    {
      'table-responsive': scrollable,
      'table-compact': compact === true || (compact === 'auto' && isMobile),
      'table-mobile': isMobile,
      'table-tablet': isTablet,
      'table-desktop': isDesktop,
      [`table-${variant}`]: variant !== 'default'
    },
    className
  );

  return (
    <div className={tableClasses}>
      <Table {...tableConfig} {...props}>
        {children}
      </Table>
    </div>
  );
};

/**
 * Card responsive pour les tableaux
 */
const ResponsiveTableCard = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  variant = 'default',
  ...props
}) => {
  const { isMobile, layoutUtils } = useResponsiveLayout();

  const cardConfig = layoutUtils.getOptimalConfig('card');

  const cardClasses = classNames(
    'responsive-table-card',
    {
      'card-mobile': isMobile,
      'card-compact': isMobile,
      [`card-${variant}`]: variant !== 'default'
    },
    className
  );

  return (
    <Card className={cardClasses} {...cardConfig} {...props}>
      {(title || subtitle || actions) && (
        <Card.Header className="bg-body-tertiary">
          <Row className="align-items-center">
            <Col>
              {title && <h5 className="mb-0">{title}</h5>}
              {subtitle && <small className="text-muted">{subtitle}</small>}
            </Col>
            {actions && <Col xs="auto">{actions}</Col>}
          </Row>
        </Card.Header>
      )}
      <Card.Body className="p-0">{children}</Card.Body>
    </Card>
  );
};

/**
 * Wrapper pour les actions de tableau responsive
 */
const ResponsiveTableActions = ({
  children,
  className = '',
  direction = 'auto',
  wrap = true,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsiveLayout();

  const actionsClasses = classNames(
    'responsive-table-actions',
    {
      'flex-column': isMobile && direction === 'auto',
      'flex-row': !isMobile && direction === 'auto',
      'flex-wrap': wrap,
      'actions-mobile': isMobile,
      'actions-tablet': isTablet
    },
    className
  );

  return (
    <div className={actionsClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Pagination responsive
 */
const ResponsivePagination = ({
  children,
  className = '',
  size = 'auto',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsiveLayout();

  const paginationClasses = classNames(
    'responsive-pagination',
    {
      'pagination-sm': size === 'auto' ? isMobile : size === 'sm',
      'pagination-mobile': isMobile,
      'pagination-tablet': isTablet
    },
    className
  );

  return (
    <div className={paginationClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Filtres responsive pour les tableaux
 */
const ResponsiveTableFilters = ({
  children,
  className = '',
  layout = 'auto',
  ...props
}) => {
  const { isMobile, isTablet } = useResponsiveLayout();

  const filtersClasses = classNames(
    'responsive-table-filters',
    {
      'filters-mobile': isMobile,
      'filters-tablet': isTablet,
      'filters-vertical': layout === 'auto' ? isMobile : layout === 'vertical',
      'filters-horizontal': layout === 'horizontal'
    },
    className
  );

  return (
    <div className={filtersClasses} {...props}>
      {children}
    </div>
  );
};

// PropTypes
ResponsiveTable.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  striped: PropTypes.bool,
  hover: PropTypes.bool,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['auto', 'sm', 'lg']),
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark'
  ]),
  scrollable: PropTypes.bool,
  compact: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['auto'])])
};

ResponsiveTableCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark'
  ])
};

ResponsiveTableActions.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['auto', 'row', 'column']),
  wrap: PropTypes.bool
};

ResponsivePagination.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['auto', 'sm', 'lg'])
};

ResponsiveTableFilters.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  layout: PropTypes.oneOf(['auto', 'horizontal', 'vertical'])
};

export {
  ResponsiveTable,
  ResponsiveTableCard,
  ResponsiveTableActions,
  ResponsivePagination,
  ResponsiveTableFilters
};

export default ResponsiveTable;
