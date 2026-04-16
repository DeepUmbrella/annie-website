# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
的后端 RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
