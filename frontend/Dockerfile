# ---- Dockerfile for the Vite + React frontend ----
# Build stage – use Node to install deps and compile the assets
FROM node:20-alpine AS build
WORKDIR /app

# Install only package metadata first for cache efficiency
COPY package*.json ./
RUN npm ci

# Copy the rest of the source files and build
COPY . .
RUN npm run build

# Runtime stage – serve the static assets with a lightweight Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
