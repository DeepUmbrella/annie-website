# Build stage
FROM docker.m.daocloud.io/library/node:22-alpine AS builder

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ARG NPM_REGISTRY=https://registry.npmmirror.com

# Copy package files
COPY package*.json ./

# Install full dependencies for build-time tooling such as Nest CLI and Prisma
RUN npm config set registry "${NPM_REGISTRY}" \
  && npm config set fund false \
  && npm config set audit false \
  && npm ci --prefer-offline --no-audit --no-fund \
  && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client before TypeScript build
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Build application
RUN npm run build

# Remove dev dependencies before copying runtime artifacts
RUN npm prune --omit=dev

# Production stage
FROM docker.m.daocloud.io/library/node:22-alpine AS runner

# Install dumb-init
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Copy runtime artifacts from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Set environment to production
ENV NODE_ENV=production

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
