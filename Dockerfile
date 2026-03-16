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
COPY packages/esbuild-pkg-plugin/package.json ./packages/esbuild-pkg-plugin/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy all source code
COPY . .

# Build all applications with correct base paths
RUN pnpm --filter @clubmed/esbuild-cjs-shim-plugin run build:lib
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/ pnpm --filter @clubmed/app run build
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/starter/ pnpm --filter @clubmed/starter run build
RUN NODE_ENV=${NODE_ENV} VITE_BASE_PATH=/storybook/ pnpm build:storybook
RUN NODE_ENV=${NODE_ENV} pnpm build:server
RUN NODE_ENV=${NODE_ENV} pnpm --filter docs run build

# Production stage with Node + nginx runtime
FROM node:20-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy server metadata, build artifacts, and runtime dependencies from the builder
COPY packages/server/package.json ./packages/server/package.json
#COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/views ./packages/server/viewsdoc

# Copy built applications to nginx html directory
COPY --from=builder /app/packages/app/dist /app/packages/app/dist
COPY --from=builder /app/packages/starter/dist /app/packages/starter/dist
COPY --from=builder /app/storybook-static /app/storybook-static
COPY --from=builder /app/packages/docs/build /app/packages/docs/build

EXPOSE 8083

CMD "pnpm --filter @clubmed/server start:prod"
