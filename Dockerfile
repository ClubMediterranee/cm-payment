# Multi-stage build for the payment applications
FROM node:20-alpine AS builder
ARG NODE_ENV

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/app/package.json ./packages/app/
COPY packages/starter/package.json ./packages/starter/
COPY packages/sdk/package.json ./packages/sdk/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy all source code
COPY . .

# Build all applications with correct base paths
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/ pnpm --filter @clubmed/app run build
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/starter/ pnpm --filter @clubmed/starter run build
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/storybook/ pnpm build:storybook

# Production stage with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built applications to nginx html directory
COPY --from=builder /app/packages/app/dist /usr/share/nginx/html
COPY --from=builder /app/packages/starter/dist /usr/share/nginx/html/starter
COPY --from=builder /app/storybook-static /usr/share/nginx/html/storybook

# Expose port 8080 (non-privileged). Actual port can be overridden via $PORT at runtime
EXPOSE 8080

# Start nginx with environment substitution for API_TARGET and PORT
CMD ["/bin/sh", "-c", "API_TARGET=${API_TARGET:-https://api.integ.clubmed.com}; PORT=${PORT:-8080}; export API_TARGET PORT; envsubst '$API_TARGET $PORT' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.rendered && exec nginx -g 'daemon off;' -c /etc/nginx/nginx.conf.rendered"]