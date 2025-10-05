# Stage 1: Build the NestJS app
FROM node:20.18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Run the compiled app
FROM node:20.18-alpine AS runner
WORKDIR /app

# Copy package manifests and install dependencies (kept from builder)
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled dist and entrypoint script
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]