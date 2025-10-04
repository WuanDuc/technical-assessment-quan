# Stage 1: Build the NestJS app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Run the compiled app
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled dist and other needed files
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main"]