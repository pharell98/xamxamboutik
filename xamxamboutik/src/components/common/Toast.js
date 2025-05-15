// Toast.js
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import ToastPortal from './ToastPortal';

// Contexte pour gérer les toasts globalement
const ToastContext = createContext(null);

// Types de toasts avec leurs configurations
const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    backgroundColor: '#d1e7dd',
    borderColor: '#0f5132',
    iconColor: '#0f5132'
  },
  error: {
    icon: AlertCircle,
    backgroundColor: '#f8d7da',
    borderColor: '#842029',
    iconColor: '#842029'
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: '#fff3cd',
    borderColor: '#664d03',
    iconColor: '#664d03'
  },
  info: {
    icon: Info,
    backgroundColor: '#cff4fc',
    borderColor: '#055160',
    iconColor: '#055160'
  }
};

// Styles intégrés
const styles = {
  toastContainer: {
    position: 'fixed',
    top: '90px',
    right: '20px',
    zIndex: 9999,
    maxWidth: '400px',
    width: '100%'
  },
  toastItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    opacity: 1,
    transform: 'translateX(0)'
  },
  toastItemHide: {
    opacity: 0,
    transform: 'translateX(100%)'
  },
  iconWrapper: {
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%'
  },
  closeButton: {
    marginLeft: 'auto',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'rgba(0, 0, 0, 0.5)'
  }
};

// Composant Toast individuel
const ToastItem = ({
  title,
  message,
  type = 'info',
  duration = 7000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const toastConfig = TOAST_TYPES[type];
  const Icon = toastConfig.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onCloseRef.current();
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      style={{
        ...styles.toastItem,
        ...(isVisible ? {} : styles.toastItemHide),
        backgroundColor: toastConfig.backgroundColor,
        border: `1px solid ${toastConfig.borderColor}`
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        style={{
          ...styles.iconWrapper,
          backgroundColor: toastConfig.backgroundColor,
          border: `1px solid ${toastConfig.borderColor}`
        }}
      >
        <Icon style={{ color: toastConfig.iconColor, fontSize: '24px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <p style={{ margin: 0 }}>{message}</p>
      </div>
      <button style={styles.closeButton} aria-label="Close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

ToastItem.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};

// Provider pour gérer l'état global des toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(toast => {
    setToasts(prev => [...prev, { ...toast, id: Date.now() }]);
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <>
      <ToastContext.Provider value={{ addToast }}>
        {children}
      </ToastContext.Provider>
      <ToastPortal>
        <div style={styles.toastContainer}>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              title={toast.title}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </ToastPortal>
    </>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook personnalisé pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
