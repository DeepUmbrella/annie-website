# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client before TypeScript build
ARG DATABASE_URL=postgresql://annie:change_this_password_in_production@postgres:5432/annie_db?schema=public
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy runtime artifacts from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
