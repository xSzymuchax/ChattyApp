FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=/api
ARG VITE_RT_API_URL=/ws
ARG VITE_TOKEN_KEY=chatty.authToken
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RT_API_URL=$VITE_RT_API_URL
ENV VITE_TOKEN_KEY=$VITE_TOKEN_KEY
RUN npm run build

FROM caddy:2-alpine
COPY docker/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend /app/dist /srv
