import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Loading = () => {
  return (
    <div className="text-center py-2">
      <FontAwesomeIcon icon={faSpinner} spin /> Chargement...
    </div>
  );
};

export default Loading;
