// Configuration des variables d'environnement pour la production
// Ce fichier est injecté dynamiquement par Docker au démarrage du conteneur
window._env_ = {
  REACT_APP_WS_URL: '${REACT_APP_WS_URL}',
  REACT_APP_API_URL: '${REACT_APP_API_URL}'
};
