# Build stage
FROM docker.m.daocloud.io/library/node:22-alpine AS builder

WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com

COPY package*.json ./
RUN npm config set registry "${NPM_REGISTRY}" \
  && npm config set fund false \
  && npm config set audit false \
  && npm ci --prefer-offline --no-audit --no-fund \
  && npm cache clean --force

COPY . .
RUN npm run build


# Production stage
FROM docker.m.daocloud.io/library/nginx:alpine AS runner

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
