# @clubmed/start-spa

Application to start a new Payment flow using Club Med's payment SDK with OIDC authentication.

## Description

This starter application provides a user-friendly interface to initiate payment flows with various OIDC (OpenID Connect) providers. It supports multiple authentication methods and allows users to configure payment parameters such as customer ID, booking ID, and proposal ID.

## Features

- **OIDC Authentication**: Support for multiple OIDC issuer types (GM, GO, PARTNER)
- **Multi-locale Support**: Available in French (fr-FR), English US (en-US), and English GB (en-GB)
- **Payment Configuration**: Configure customer ID, booking ID, and proposal ID
- **React-based UI**: Built with React 18 and Club Med's Trident UI components
- **Form Validation**: Integrated form handling with react-hook-form
- **Environment Configuration**: Support for multiple environments (development, staging, production, integration)
- **HTTPS Development**: Built-in SSL support for secure local development
- **Testing Integration**: Vitest configuration for unit and integration testing

## Installation

This package is part of the Club Med payment monorepo. Install dependencies from the project root:

```bash
pnpm install
```

## Development

### Start Development Server

```bash
pnpm dev
```

The application will be available at `https://payment-starter:4004` with SSL enabled by default.

**Note**: The development server automatically enables HTTPS using a self-signed certificate for secure local development. You can configure the host using the `HOST` environment variable in your configuration files.

### Available Scripts

- `pnpm dev` - Start development server on port 4004
- `pnpm build` - Build the application for production
- `pnpm preview` - Preview the production build
- `pnpm generate:types` - Generate types using Orval

## Configuration

### Environment Variables

The application uses `dotenv-flow` to load environment configurations from the `config/` directory:

- `config/.env` - Default configuration
- `config/.env.development` - Development environment
- `config/.env.staging` - Staging environment
- `config/.env.production` - Production environment
- `config/.env.integration` - Integration environment

**Available Environment Variables:**
- `HOST` - Configure the development server host (default: payment-starter)

### OIDC Providers

The application supports the following OIDC issuer types:

- **GM**: Club Med GM provider
- **GO**: Club Med GO provider  
- **PARTNER**: Partner provider

### Supported Locales

- `fr-FR` - French (France)
- `en-US` - English (United States)
- `en-GB` - English (Great Britain)

## Usage

1. **Select Locale**: Choose your preferred language from the dropdown
2. **Select OIDC Provider**: Choose the appropriate OIDC issuer type
3. **Configure Payment Parameters**:
   - **Customer ID**: Required for GM provider
   - **Proposal ID**: Optional - Use an existing proposal
   - **Booking ID**: Optional - Use an existing booking
4. **Start Flow**: Click "Start flow" to initiate the payment process

## Dependencies

### Main Dependencies

- **@clubmed/trident-ui**: Club Med's UI component library
- **@clubmed/trident-icons**: Club Med's icon library
- **@clubmed/payment-sdk**: Club Med's payment SDK
- **react**: React framework (v18.3.1)
- **react-dom**: React DOM renderer
- **react-hook-form**: Form handling library
- **react-oidc-context**: OIDC context provider
- **oidc-client-ts**: OIDC client library
- **wouter**: Lightweight router
- **@tanstack/react-query**: Data fetching library
- **zod**: Schema validation

## Architecture

```
src/
├── components/
│   ├── FormStarter.tsx      # Main form component
│   ├── PageLayout.tsx       # Layout component
│   └── select/              # Custom select components
├── providers/
│   └── RootProvider.tsx     # Root context provider
├── config.ts                # Application configuration
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## Development Setup

### Prerequisites

Before running the project, you need to configure your system's hosts file to properly access the application:

1. **Edit your `/etc/hosts` file** (requires administrator privileges):
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add the following line** to the file:
   ```
   127.0.0.1 payment-starter
   ```

3. **Save and close** the file

### Setup Instructions

1. Ensure you have Node.js and pnpm installed
2. Clone the repository and navigate to the project root
3. Install dependencies: `pnpm install`
4. Navigate to the starter package: `cd packages/starter`
5. Configure the hosts file as described above
6. Start the development server: `pnpm dev`

## Building for Production

```bash
pnpm build
```

The built files will be available in the `dist` directory.

## Contributing

This package is part of the Club Med payment system. Please follow the project's contribution guidelines and ensure all changes are properly tested.