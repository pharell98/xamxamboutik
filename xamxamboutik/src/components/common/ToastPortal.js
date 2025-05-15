import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const ToastPortal = ({ children }) => {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return createPortal(children, elRef.current);
};

ToastPortal.propTypes = {
  children: PropTypes.node.isRequired
};

export default ToastPortal;
