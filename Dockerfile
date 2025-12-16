# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Allow passing GEMINI_API_KEY at build time
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Build the production bundle
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
