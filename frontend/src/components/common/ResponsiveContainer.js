import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import useResponsiveLayout from 'hooks/useResponsiveLayout';

/**
 * Container responsive intelligent avec auto-adaptation
 */
const ResponsiveContainer = ({
  children,
  fluid = false,
  className = '',
  spacing = 'normal',
  maxWidth = null,
  centered = true,
  ...props
}) => {
  const { getColumnConfig, getSpacingConfig, layoutClasses } =
    useResponsiveLayout();

  const containerClasses = classNames(
    'responsive-container',
    layoutClasses,
    {
      'container-fluid': fluid,
      container: !fluid,
      'mx-auto': centered && !fluid,
      [`spacing-${spacing}`]: spacing !== 'normal'
    },
    className
  );

  const containerStyle = {
    ...(maxWidth && { maxWidth }),
    ...props.style
  };

  return (
    <Container
      fluid={fluid}
      className={containerClasses}
      style={containerStyle}
      {...props}
    >
      {children}
    </Container>
  );
};

/**
 * Row responsive avec gestion intelligente des colonnes
 */
const ResponsiveRow = ({
  children,
  className = '',
  spacing = 'normal',
  align = 'start',
  justify = 'start',
  wrap = true,
  ...props
}) => {
  const { getSpacingConfig, layoutClasses } = useResponsiveLayout();

  const rowClasses = classNames(
    'responsive-row',
    layoutClasses,
    {
      [`align-items-${align}`]: align !== 'start',
      [`justify-content-${justify}`]: justify !== 'start',
      'flex-nowrap': !wrap,
      [`spacing-${spacing}`]: spacing !== 'normal'
    },
    className
  );

  return (
    <Row className={rowClasses} {...props}>
      {children}
    </Row>
  );
};

/**
 * Colonne responsive avec configuration automatique
 */
const ResponsiveCol = ({
  children,
  className = '',
  size = 12,
  offset = 0,
  order = 0,
  align = 'start',
  ...props
}) => {
  const { getColumnConfig, layoutClasses } = useResponsiveLayout();

  // Configuration automatique des colonnes
  const columnConfig = getColumnConfig(size);

  const colClasses = classNames(
    'responsive-col',
    layoutClasses,
    {
      [`col-${columnConfig.xs}`]: columnConfig.xs,
      [`col-sm-${columnConfig.sm}`]: columnConfig.sm,
      [`col-md-${columnConfig.md}`]: columnConfig.md,
      [`col-lg-${columnConfig.lg}`]: columnConfig.lg,
      [`col-xl-${columnConfig.xl}`]: columnConfig.xl,
      [`offset-${offset}`]: offset > 0,
      [`order-${order}`]: order > 0,
      [`text-${align}`]: align !== 'start'
    },
    className
  );

  return (
    <Col className={colClasses} {...props}>
      {children}
    </Col>
  );
};

/**
 * Wrapper pour les composants nécessitant une adaptation responsive
 */
const ResponsiveWrapper = ({
  children,
  component = 'div',
  className = '',
  responsive = true,
  mobile = {},
  tablet = {},
  desktop = {},
  ...props
}) => {
  const {
    isMobile,
    isTablet,
    isDesktop,
    responsive: responsiveUtils
  } = useResponsiveLayout();

  const Component = component;

  // Configuration responsive
  const config = responsive
    ? responsiveUtils.getConfig({
        mobile: mobile,
        tablet: tablet,
        desktop: desktop,
        default: {}
      })
    : {};

  const wrapperClasses = classNames(
    'responsive-wrapper',
    {
      mobile: isMobile,
      tablet: isTablet,
      desktop: isDesktop
    },
    className,
    config.className
  );

  const wrapperStyle = {
    ...props.style,
    ...config.style
  };

  return (
    <Component
      className={wrapperClasses}
      style={wrapperStyle}
      {...props}
      {...config}
    >
      {children}
    </Component>
  );
};

/**
 * Composant pour les breakpoints conditionnels
 */
const ResponsiveBreakpoint = ({
  children,
  show = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
  hide = [],
  className = '',
  ...props
}) => {
  const { isXs, isSm, isMd, isLg, isXl, isXxl } = useResponsiveLayout();

  const breakpointFlags = {
    xs: isXs,
    sm: isSm,
    md: isMd,
    lg: isLg,
    xl: isXl,
    xxl: isXxl
  };

  const shouldShow =
    show.some(bp => breakpointFlags[bp]) &&
    !hide.some(bp => breakpointFlags[bp]);

  if (!shouldShow) return null;

  return (
    <div className={classNames('responsive-breakpoint', className)} {...props}>
      {children}
    </div>
  );
};

// PropTypes
ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  fluid: PropTypes.bool,
  className: PropTypes.string,
  spacing: PropTypes.oneOf(['none', 'small', 'normal', 'large']),
  maxWidth: PropTypes.string,
  centered: PropTypes.bool
};

ResponsiveRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  spacing: PropTypes.oneOf(['none', 'small', 'normal', 'large']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf([
    'start',
    'center',
    'end',
    'between',
    'around',
    'evenly'
  ]),
  wrap: PropTypes.bool
};

ResponsiveCol.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  offset: PropTypes.number,
  order: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end'])
};

ResponsiveWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  component: PropTypes.string,
  className: PropTypes.string,
  responsive: PropTypes.bool,
  mobile: PropTypes.object,
  tablet: PropTypes.object,
  desktop: PropTypes.object
};

ResponsiveBreakpoint.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.arrayOf(
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'])
  ),
  hide: PropTypes.arrayOf(
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'])
  ),
  className: PropTypes.string
};

export {
  ResponsiveContainer,
  ResponsiveRow,
  ResponsiveCol,
  ResponsiveWrapper,
  ResponsiveBreakpoint
};

export default ResponsiveContainer;
