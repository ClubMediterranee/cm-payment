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
COPY packages/docs/package.json ./packages/docs/
COPY packages/server/package.json ./packages/server/

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
RUN NODE_ENV=${NODE_ENV} pnpm build:server
RUN NODE_ENV=${NODE_ENV} pnpm --filter docs run build

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
COPY --from=builder /app/packages/docs/build /usr/share/nginx/html/docs

# Expose port 8080 (non-privileged). Actual port can be overridden via $PORT at runtime
EXPOSE 8080

# Start nginx with environment substitution for API_TARGET, REST_TARGET and PORT
CMD ["/bin/sh", "-c", "API_TARGET=${API_TARGET:-https://api.integ.clubmed.com}; REST_TARGET=${REST_TARGET:-http://127.0.0.1:8083}; PORT=${PORT:-8080}; export API_TARGET REST_TARGET PORT; envsubst '$API_TARGET $REST_TARGET $PORT' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.rendered && exec nginx -g 'daemon off;' -c /etc/nginx/nginx.conf.rendered"]
