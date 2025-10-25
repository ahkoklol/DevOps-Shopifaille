# Stage 1: Build the React application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy lock file and package files
COPY package.json package-lock.json ./
COPY tsconfig*.json vite.config.ts ./

COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

# Install dependencies and build the static assets
RUN npm install
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine
# Copy the built static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]