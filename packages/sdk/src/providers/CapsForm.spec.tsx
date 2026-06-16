import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Action } from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { TOKENS } from '../types/Tokens';

vi.mock('../hooks/utils/useCapsConfigContext');
vi.mock('../hooks/data/usePaymentConfig');
vi.mock('../hooks/data/useActionResolver');
vi.mock('../hooks/data/usePaymentProviders');
vi.mock('../hooks/data/usePaymentSchedule');
vi.mock('../hooks/useCapsForm');
vi.mock('../components/Form');
vi.mock('react-error-boundary');

const mockUseCapsConfigContext = vi.fn(() => ({
  id: 'PROP001',
  content: {},
  oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
}));

const mockUseOidcContext = vi.fn(() => ({
  isSeller: false,
}));

const mockUsePaymentConfig = vi.fn(() => ({
  data: { providers: {} },
}));

const mockUseActionResolver = vi.fn((action) => action);

const mockUseCapsForm = vi.fn(() => ({
  handleSubmit: vi.fn(),
  watch: vi.fn(),
  setValue: vi.fn(),
  formState: { errors: {} },
}));

const mockUseSuspenseQueries = vi.fn(() => [
  {
    data: {
      paymentProviders: [
        {
          id: 'HIPAY',
          name: 'HiPay',
          integration_mode: 'hosted_field',
          payment_conditions: [{ id: 'PAYMENT_FULL', name: 'Paiement total' }],
        },
      ],
    },
  },
  {
    data: [
      {
        id: 'schedule-1',
        amount: 10000,
        currency: 'EUR',
      },
    ],
  },
]);

vi.mock('../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => mockUseCapsConfigContext(),
  useOidcContext: () => mockUseOidcContext(),
}));

vi.mock('../hooks/data/usePaymentConfig', () => ({
  usePaymentConfig: () => mockUsePaymentConfig(),
}));

vi.mock('../hooks/data/useActionResolver', () => ({
  useActionResolver: (action: Action) => mockUseActionResolver(action),
}));

vi.mock('../hooks/useCapsForm', () => ({
  useCapsForm: () => mockUseCapsForm(),
}));

vi.mock('../hooks/data/usePaymentProviders', () => ({
  paymentProvidersQueryOptions: () => ({ queryKey: ['payment-providers'], queryFn: vi.fn() }),
}));

vi.mock('../hooks/data/usePaymentSchedule', () => ({
  paymentScheduleQueryOptions: () => ({ queryKey: ['payment-schedule'], queryFn: vi.fn() }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useSuspenseQueries: () => mockUseSuspenseQueries(),
  };
});

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../components/Form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
}));

import { CapsForm } from './CapsForm';

const MockPaymentSchedule = () => <div>PaymentSchedule</div>;
MockPaymentSchedule.COMPONENT_KEY = TOKENS.PaymentSchedule;

const MockCgv = () => <div>Cgv</div>;
MockCgv.COMPONENT_KEY = TOKENS.Cgv;

const MockPaymentProviders = () => <div>PaymentProviders</div>;
MockPaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;

const MockPaymentWidget = () => <div>PaymentWidget</div>;
MockPaymentWidget.COMPONENT_KEY = TOKENS.PaymentWidget;

const MockSubmitButton = ({ children }: { children: React.ReactNode }) => (
  <button>{children}</button>
);
MockSubmitButton.COMPONENT_KEY = TOKENS.SubmitButton;

describe('CapsForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockUseCapsConfigContext.mockImplementation(() => ({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
    }));
    mockUseOidcContext.mockImplementation(() => ({
      isSeller: false,
    }));
  });

  it('accepte tous les composants requis pour issuer GM', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton>Payer</MockSubmitButton>
        </CapsForm>,
      );
    } catch (error: any) {
      expect(error.message).not.toContain('Missing required components');
    }

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('génère une erreur si composants manquants pour issuer GM', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
        </CapsForm>,
      );
    }).toThrow('Missing required components');

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('accepte tous les composants requis pour issuer GO', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
        </CapsForm>,
      );
    } catch (error: any) {
      expect(error.message).not.toContain('Missing required components');
    }

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('génère une erreur si composants manquants pour issuer GO', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
        </CapsForm>,
      );
    }).toThrow('Missing required components');

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('accepte un formulaire minimal pour issuer PARTNERS', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockSubmitButton>Valider</MockSubmitButton>
        </CapsForm>,
      );
    } catch (error: any) {
      expect(error.message).not.toContain('Missing required components');
    }

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('accepte un formulaire vide pour issuer PARTNERS', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <div>Custom content</div>
        </CapsForm>,
      );
    } catch (error: any) {
      expect(error.message).not.toContain('Missing required components');
    }

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it.skip('utilise le action fourni en props', () => {
    mockUseCapsConfigContext.mockReturnValueOnce({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
    });

    mockUseActionResolver.mockClear();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_RESA}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton>Payer</MockSubmitButton>
        </CapsForm>,
      );
    } catch {
      // Ignore render errors
    }

    expect(mockUseActionResolver).toHaveBeenCalledWith(Action.PAYMENT_RESA);

    consoleErrorSpy.mockRestore();
  });
});
