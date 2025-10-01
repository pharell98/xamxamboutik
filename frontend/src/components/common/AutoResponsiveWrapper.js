import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  ResponsiveRow,
  ResponsiveCol
} from './ResponsiveContainer';

/**
 * Wrapper automatique qui applique la responsivité sans configuration
 * Utilise les classes CSS pour l'adaptation automatique
 */
const AutoResponsiveWrapper = ({
  children,
  className = '',
  fluid = false,
  spacing = 'normal',
  ...props
}) => {
  return (
    <ResponsiveContainer
      fluid={fluid}
      spacing={spacing}
      className={`auto-responsive-wrapper ${className}`}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

/**
 * Row automatique responsive
 */
const AutoResponsiveRow = ({
  children,
  className = '',
  spacing = 'normal',
  ...props
}) => {
  return (
    <ResponsiveRow
      spacing={spacing}
      className={`auto-responsive-row ${className}`}
      {...props}
    >
      {children}
    </ResponsiveRow>
  );
};

/**
 * Colonne automatique responsive
 */
const AutoResponsiveCol = ({
  children,
  className = '',
  size = 12,
  ...props
}) => {
  return (
    <ResponsiveCol
      size={size}
      className={`auto-responsive-col ${className}`}
      {...props}
    >
      {children}
    </ResponsiveCol>
  );
};

// PropTypes
AutoResponsiveWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  spacing: PropTypes.oneOf(['none', 'small', 'normal', 'large'])
};

AutoResponsiveRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  spacing: PropTypes.oneOf(['none', 'small', 'normal', 'large'])
};

AutoResponsiveCol.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
};

export { AutoResponsiveWrapper, AutoResponsiveRow, AutoResponsiveCol };

export default AutoResponsiveWrapper;
