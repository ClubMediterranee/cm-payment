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
RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts

# Copy all source code
COPY . .

# Build all applications with correct base paths
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

RUN npm install -g pnpm

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy server metadata, build artifacts, and runtime dependencies from the builder
COPY packages/server/package.json ./packages/server/package.json
RUN pnpm install --frozen-lockfile --prod --filter @clubmed/server --ignore-scripts
#COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/views ./packages/server/views
COPY --from=builder /app/packages/server/resources ./packages/server/resources

# Copy built applications to nginx html directory
COPY --from=builder /app/packages/app/dist /app/packages/app/dist
COPY --from=builder /app/packages/starter/dist /app/packages/starter/dist
COPY --from=builder /app/storybook-static /app/storybook-static
COPY --from=builder /app/packages/docs/build /app/packages/docs/build

EXPOSE 8083

CMD ["pnpm", "--filter", "@clubmed/server", "start:prod"]
