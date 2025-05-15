FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json .env.darousalam ./
RUN cat .env.darousalam
RUN npm install
COPY . .
ENV REACT_APP_API_BASE_URL=https://darou-salam.xamxamboutik.shop/api/v1
ENV REACT_APP_WS_URL=wss://darou-salam.xamxamboutik.shop/api/v1/ws
ENV PUBLIC_URL=/
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]