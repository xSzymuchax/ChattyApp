# file for the Render deployment

FROM node:22-alpine

RUN apk add --no-cache caddy

WORKDIR /app

COPY api-gateway/package.json api-gateway/package-lock.json ./api-gateway/
COPY auth-service/package.json auth-service/package-lock.json ./auth-service/
COPY user-service/package.json user-service/package-lock.json ./user-service/
COPY chat-service/package.json chat-service/package-lock.json ./chat-service/
COPY game-service/package.json game-service/package-lock.json ./game-service/
COPY realtime-gateway/package.json realtime-gateway/package-lock.json ./realtime-gateway/

RUN npm ci --omit=dev --prefix api-gateway \
    && npm ci --omit=dev --prefix auth-service \
    && npm ci --omit=dev --prefix user-service \
    && npm ci --omit=dev --prefix chat-service \
    && npm ci --omit=dev --prefix game-service \
    && npm ci --omit=dev --prefix realtime-gateway

COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY user-service ./user-service
COPY chat-service ./chat-service
COPY game-service ./game-service
COPY realtime-gateway ./realtime-gateway
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 10000

CMD ["/entrypoint.sh"]
