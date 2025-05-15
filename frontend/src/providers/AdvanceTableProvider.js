import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

export const AdvanceTableContext = createContext({});

const AdvanceTableProvider = ({ children, ...rest }) => {
  return (
    <AdvanceTableContext.Provider value={{ ...rest }}>
      {children}
    </AdvanceTableContext.Provider>
  );
};

AdvanceTableProvider.propTypes = { children: PropTypes.node };

export const useAdvanceTableContext = () => useContext(AdvanceTableContext);

export default AdvanceTableProvider;
