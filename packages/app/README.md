# @clubmed/payment-app

Centralized payment application for testing Club Med's payment workflows with configurable parameters.

## Description

The app is a centralized payment application that provides a testing environment for Club Med's payment flows. It accepts URL parameters to configure the payment context including locale, booking/proposal IDs, and OIDC issuer types.

## Features

- **Centralized Payment Interface**: Single payment page for all Club Med payment flows
- **URL Parameter Configuration**: Configure payment context via query parameters (locale, booking_id, proposal_id, issuer_type)
- **OIDC Authentication**: Support for multiple OIDC issuer types (GM, GO, PARTNER)
- **Multi-locale Support**: Available in French (fr-FR), English US (en-US), and English GB (en-GB)
- **Payment SDK Integration**: Built with Club Med's payment-sdk for payment schedule and providers
- **Authentication Flow**: Automatic OIDC authentication for booking-based payments
- **Iframe Support**: Can be embedded as an iframe in other applications
- **HTTPS Development**: Built-in SSL support for secure local development

## Prerequisites

**Host Configuration**: Ensure your `/etc/hosts` file is configured with:

```
127.0.0.1 payment
```

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

The application will be available at `https://cm-payment:4003` with SSL enabled by default.

### Available Scripts

- `pnpm dev` - Start development server on port 4003
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

- `HOST` - Configure the development server host (default: payment)
- `VITE_BASE_PATH` - Base URL for the application
- `VITE_GM_OIDC_URL` - Club Med GM OIDC provider URL
- `VITE_GM_OIDC_CLIENT_ID` - GM OIDC client ID
- `VITE_GO_OIDC_CLIENT` - Club Med GO OIDC provider URL
- `VITE_GO_OIDC_CLIENT_ID` - GO OIDC client ID
- `VITE_API_ENDPOINT` - Club Med API endpoint
- `VITE_API_KEY` - API key for Club Med services
- `VITE_SELLER_API_KEY` - Seller API key

## Usage

### URL Structure

The app accepts payment parameters via URL path and query parameters:

```
https://cm-payment:4003/:issuer/:type/:id/:locale?customer_id=123
```

**Query Parameters:**

- `issuer` - OIDC issuer type (`GM`, `GO`, `PARTNER`)
- `type` - Payment type (`booking` or `proposal`)
- `id` - Booking ID or Proposal ID
- `locale` - Language locale (optional, defaults to `fr-FR`)
- `customer_id` - Customer identifier (required for some flows)

### Example URLs

1. **Booking Payment with GM Provider:**

   ```
   https://cm-payment:4003/GM/booking/123456/fr-FR?customer_id=789
   ```

2. **Proposal Payment with GO Provider:**

   ```
   https://cm-payment:4003/GO/proposal/654321/en-US
   ```

3. **Partner Payment:**
   ```
   https://cm-payment:4003/PARTNER/booking/111222/en-GB?customer_id=333
   ```

### Workflow Integration

1. **Open a payment URL**: Navigate to the app with the appropriate path and query parameters (see URL Structure above)
2. **Payment Processing**: The app handles the complete payment workflow
3. **Authentication**: Automatic OIDC authentication for booking-based payments
4. **Completion**: Redirect to confirmation page upon successful payment

## Dependencies

### Main Dependencies

- **@clubmed/caps**: Club Med's payment SDK for payment processing
- **@clubmed/trident-ui**: Club Med's UI component library
- **@clubmed/trident-icons**: Club Med's icon library
- **react**: React framework (v18.3.1)
- **react-dom**: React DOM renderer
- **react-oidc-context**: OIDC context provider for authentication
- **oidc-client-ts**: OIDC client library
- **wouter**: Lightweight router for navigation
- **@tanstack/react-query**: Data fetching library
- **zod**: Schema validation for URL parameters
- **js-cookie**: Cookie management
- **classnames**: CSS class utilities

## Architecture

```
src/
├── components/
│   ├── Header.tsx           # Application header
│   └── Stay.tsx             # Stay information display
├── pages/
│   ├── PaymentPage.tsx      # Main payment interface
│   └── RedirectPage.tsx     # OIDC redirect handling
├── providers/
│   ├── AppProvider.tsx      # App context and SDK configuration
│   ├── AuthProvider.tsx     # OIDC authentication provider
│   └── RootProvider.tsx     # Root context provider
├── hooks/
│   ├── useAppContext.ts     # App context hook
│   ├── useUserId.ts         # User ID extraction hook
│   └── useStay.ts           # Stay data hook
├── utils/
│   ├── constants.ts         # Application constants
│   ├── fetcher.ts           # API fetching utilities
│   └── router.ts            # Routing utilities
├── config/
│   └── AppSettings.ts       # Application configuration
├── Router.tsx               # Main application router
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## Payment Flow

1. **Parameter Validation**: URL parameters are validated using Zod schema
2. **Authentication Check**: Required for booking-based payments
3. **SDK Configuration**: Payment SDK is configured with validated parameters
4. **Payment Interface**: Display payment schedule and provider options
5. **Payment Processing**: Handle payment submission via iframe provider
6. **Completion**: Redirect to confirmation page or handle errors

## Development Setup

### Prerequisites

1. **Configure hosts file** (`/etc/hosts`):
   ```
   127.0.0.1 payment
   ```

### Setup Instructions

1. Ensure you have Node.js and pnpm installed
2. Clone the repository and navigate to the project root
3. Install dependencies: `pnpm install`
4. Configure the hosts file as described above
5. Start the app: `cd packages/app && pnpm dev`

## Building for Production

```bash
pnpm build
```

The built files will be available in the `dist` directory.

## Testing

To test the app:

1. **Start the application:**
   - App: `https://cm-payment:4003`

2. **Open a payment URL** with the appropriate path and query parameters to:
   - Select locale and OIDC provider
   - Configure customer ID, booking ID, or proposal ID

3. **Complete the payment flow** in the app interface

## Contributing

This package is part of the Club Med payment system. Please follow the project's contribution guidelines and ensure all changes are properly tested.
