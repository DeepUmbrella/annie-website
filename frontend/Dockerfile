# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install system dependencies for native bindings
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production dependencies stage
FROM node:22-alpine AS deps

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM nginx:alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Change ownership to existing nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chown -R nginx:nginx /etc/nginx/conf.d

# Switch to nginx user (already exists in nginx:alpine)
USER nginx

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
