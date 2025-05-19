#!/bin/sh
# Injecter les variables d’environnement dans un fichier JavaScript
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_API_BASE_URL: "$REACT_APP_API_BASE_URL",
  REACT_APP_WS_URL: "$REACT_APP_WS_URL",
  PUBLIC_URL: "$PUBLIC_URL"
};
EOF
exec "$@"