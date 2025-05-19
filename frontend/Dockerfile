FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Créer un fichier config.js pour injecter les variables d'environnement au runtime
RUN echo "window._env_ = {" > /usr/share/nginx/html/config.js && \
    echo "  REACT_APP_API_BASE_URL: '\${REACT_APP_API_BASE_URL:-}'," >> /usr/share/nginx/html/config.js && \
    echo "  REACT_APP_WS_URL: '\${REACT_APP_WS_URL:-}'," >> /usr/share/nginx/html/config.js && \
    echo "  PUBLIC_URL: '\${PUBLIC_URL:-}'" >> /usr/share/nginx/html/config.js && \
    echo "};" >> /usr/share/nginx/html/config.js

# Remplacer les variables d'environnement dans config.js au démarrage
CMD envsubst '\${REACT_APP_API_BASE_URL} \${REACT_APP_WS_URL} \${PUBLIC_URL}' < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.js.tmp && mv /usr/share/nginx/html/config.js.tmp /usr/share/nginx/html/config.js && nginx -g 'daemon off;'

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log
EXPOSE 80