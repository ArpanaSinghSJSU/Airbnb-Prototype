# Multi-stage build for React frontend

# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables to empty strings (use relative URLs)
ENV REACT_APP_TRAVELER_SERVICE_URL=""
ENV REACT_APP_OWNER_SERVICE_URL=""
ENV REACT_APP_PROPERTY_SERVICE_URL=""
ENV REACT_APP_BOOKING_SERVICE_URL=""
ENV REACT_APP_AI_AGENT_URL=""

# Build the React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 (to match our service port)
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

