# Multi-stage build for the payment applications
FROM node:24.17.0-alpine AS builder
ARG NODE_ENV

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ ./patches/
COPY packages/app/package.json ./packages/app/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/mfe/package.json ./packages/mfe/
COPY packages/server/package.json ./packages/server/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts

# Copy all source code
COPY . .

# Build all applications with correct base paths
RUN CI=true NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/ pnpm --filter @clubmed/app run build
RUN CI=true NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/storybook/ pnpm build:storybook
# Module Federation remote of the CAPS form, served by the server under /mfe
RUN CI=true NODE_ENV=${NODE_ENV} pnpm --filter @clubmed/caps-mfe run build
RUN CI=true NODE_ENV=${NODE_ENV} pnpm --filter @clubmed/server run build

# Production stage with Node + nginx runtime
FROM node:24.17.0-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# integration / staging / production, from .gitlab/envs; the ECS task may override it. Empty locally.
ARG APP_ENV_LEVEL
ENV APP_ENV_LEVEL=${APP_ENV_LEVEL}

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/patches/ ./patches/

# Copy server metadata, build artifacts, and runtime dependencies from the builder
# No packages/server/.env: deployed values come from the ECS task and the SSM Parameter Store.
COPY packages/server/package.json ./packages/server/package.json
RUN pnpm install --frozen-lockfile --prod --filter @clubmed/server --ignore-scripts
#COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/views ./packages/server/views
COPY --from=builder /app/packages/server/resources ./packages/server/resources

# Copy built applications to nginx html directory
COPY --from=builder /app/packages/app/dist /app/packages/app/dist
COPY --from=builder /app/packages/mfe/dist /app/packages/mfe/dist
COPY --from=builder /app/storybook-static /app/storybook-static

EXPOSE 8083

# Node is the main process so it receives SIGTERM and runs the graceful stop (`platform.stop()`); pnpm as PID 1 may
# not forward it. The server reads ./package.json, so it runs from its package directory.
WORKDIR /app/packages/server
CMD ["node", "dist/index.js"]
