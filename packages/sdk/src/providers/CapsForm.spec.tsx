import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Action } from '../__generated__/index.schemas';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { TOKENS } from '../types/Tokens';

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

const mockUseCapsForm = vi.fn((_params?: unknown) => ({
  handleSubmit: vi.fn(),
  watch: vi.fn(),
  setValue: vi.fn(),
  formState: { errors: {} },
}));

const paymentProviders = [
  {
    id: 'HIPAY',
    name: 'HiPay',
    integration_mode: 'hosted_field',
    payment_conditions: [{ id: 'PAYMENT_FULL', name: 'Paiement total' }],
  },
];

const queries = (providers: object[]) => [
  { data: { paymentProviders: providers, buyNowPayLaterProviders: [] } },
  {
    data: [
      {
        id: 'schedule-1',
        amount: 10000,
        currency: 'EUR',
      },
    ],
  },
];

const mockUseSuspenseQueries = vi.fn(() => queries(paymentProviders));

vi.mock('../hooks/utils/useCapsConfigContext', () => ({
  useCapsConfigContext: () => mockUseCapsConfigContext(),
  useOidcContext: () => mockUseOidcContext(),
}));

vi.mock('../hooks/data/usePaymentConfig', () => ({
  usePaymentConfig: () => mockUsePaymentConfig(),
  paymentConfigQueryOptions: () => ({ queryKey: ['payment-config'], queryFn: vi.fn() }),
}));

vi.mock('../components/BillingAddress', () => ({
  BillingAddress: {
    Preload: ({ countryCode }: { countryCode: string }) => <p>preload {countryCode}</p>,
  },
}));

vi.mock('../hooks/data/useOverpaymentAllowance', () => ({
  useOverpaymentAllowance: () => ({ data: undefined }),
}));

vi.mock('../hooks/data/useActionResolver', () => ({
  useActionResolver: (action: Action) => mockUseActionResolver(action),
}));

vi.mock('../hooks/useCapsForm', () => ({
  useCapsForm: (params: unknown) => mockUseCapsForm(params),
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

const MockContactChoice = () => <div>ContactChoice</div>;
MockContactChoice.COMPONENT_KEY = TOKENS.ContactChoice;

const MockPaymentPanel = () => <div>PaymentPanel</div>;
MockPaymentPanel.COMPONENT_KEY = TOKENS.PaymentPanel;

const MockPaymentProviders = () => <div>PaymentProviders</div>;
MockPaymentProviders.COMPONENT_KEY = TOKENS.PaymentProviders;

const MockBillingAddress = () => <div>BillingAddress</div>;
MockBillingAddress.COMPONENT_KEY = TOKENS.BillingAddress;

const MockPaymentWidget = () => <div>PaymentWidget</div>;
MockPaymentWidget.COMPONENT_KEY = TOKENS.PaymentWidget;

const MockCardInstallments = () => <div>CardInstallments</div>;
MockCardInstallments.COMPONENT_KEY = TOKENS.CardInstallments;

const MockDonation = () => <div>Donation</div>;
MockDonation.COMPONENT_KEY = TOKENS.Donation;

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

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockBillingAddress />
          <MockPaymentWidget />
          <MockCardInstallments />
          <MockSubmitButton>Payer</MockSubmitButton>
          <MockDonation />
        </CapsForm>,
      );
    }).not.toThrow(/Missing required components/);

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

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockContactChoice />
          <MockPaymentProviders />
          <MockBillingAddress />
          <MockCardInstallments />
          <MockSubmitButton>Payer</MockSubmitButton>
          <MockDonation />
        </CapsForm>,
      );
    }).not.toThrow(/Missing required components/);

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

  it('accepte tous les composants requis pour issuer PARTNERS', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockContactChoice />
          <MockPaymentProviders />
          <MockBillingAddress />
          <MockCardInstallments />
          <MockSubmitButton>Payer</MockSubmitButton>
          <MockDonation />
        </CapsForm>,
      );
    }).not.toThrow(/Missing required components/);

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('génère une erreur si composants manquants pour issuer PARTNERS', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.PARTNERS, accessToken: 'token' },
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <CapsForm action={Action.PAYMENT_CART}>
          <div>Custom content</div>
        </CapsForm>,
      );
    }).toThrow('Missing required components');

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockClear();
  });

  it('utilise le action fourni en props', () => {
    mockUseCapsConfigContext.mockReturnValue({
      id: 'PROP001',
      content: {},
      oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
    });

    const actionResolverSpy = vi.fn((action: Action) => action);
    mockUseActionResolver.mockImplementation(actionResolverSpy);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <CapsForm action={Action.PAYMENT_RESA}>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockBillingAddress />
          <MockPaymentWidget />
          <MockCardInstallments />
          <MockSubmitButton>Payer</MockSubmitButton>
          <MockDonation />
        </CapsForm>,
      );
    } catch {
      void 0;
    }

    expect(actionResolverSpy).toHaveBeenCalledWith(Action.PAYMENT_RESA);

    consoleErrorSpy.mockRestore();
    mockUseCapsConfigContext.mockReset();
  });
  describe('billing address preload', () => {
    beforeEach(() => {
      mockUseCapsConfigContext.mockReturnValue({
        id: 'PROP001',
        locale: 'fr-FR',
        content: {},
        oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
      } as never);
    });

    afterEach(() => {
      mockUseSuspenseQueries.mockImplementation(() => queries(paymentProviders));
    });

    const renderForm = () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        return render(
          <CapsForm>
            <MockPaymentSchedule />
            <MockCgv />
            <MockPaymentProviders />
            <MockBillingAddress />
            <MockPaymentWidget />
            <MockCardInstallments />
            <MockSubmitButton>Payer</MockSubmitButton>
            <MockDonation />
          </CapsForm>,
        );
      } finally {
        consoleErrorSpy.mockRestore();
      }
    };

    it('preloads the billing address when a provider asks for the form', () => {
      mockUseSuspenseQueries.mockImplementation(() =>
        queries([{ ...paymentProviders[0], billing_address_form: true }]),
      );

      const { getByText } = renderForm();

      expect(getByText('preload FR')).toBeTruthy();
    });

    it('does not preload the billing address when no provider asks for the form', () => {
      const { queryByText } = renderForm();

      expect(queryByText(/preload/)).toBeNull();
    });
  });
  describe('installments choice', () => {
    const multiConditionProviders = [
      {
        ...paymentProviders[0],
        payment_conditions: {
          Visa: [
            { id: 'visa-1x', payment_count: 1 },
            { id: 'visa-3x', payment_count: 3 },
          ],
        },
      },
    ];

    const renderWithTheme = (theme?: 'current' | 'legacy') => {
      mockUseCapsConfigContext.mockReturnValue({
        id: 'PROP001',
        locale: 'fr-FR',
        content: {},
        theme,
        oidc: { issuerType: OidcIssuerTypes.GM, accessToken: 'token' },
      } as never);
      mockUseSuspenseQueries.mockImplementation(() => queries(multiConditionProviders));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        render(
          theme === 'current' ? (
            <CapsForm>
              <MockPaymentSchedule />
              <MockPaymentPanel />
            </CapsForm>
          ) : (
            <CapsForm>
              <MockPaymentSchedule />
              <MockCgv />
              <MockPaymentProviders />
              <MockBillingAddress />
              <MockPaymentWidget />
              <MockCardInstallments />
              <MockSubmitButton>Payer</MockSubmitButton>
              <MockDonation />
            </CapsForm>
          ),
        );
      } finally {
        consoleErrorSpy.mockRestore();
      }

      return mockUseCapsForm.mock.lastCall?.[0] as {
        config: { requiresPaymentCondition: (providerId: string) => boolean };
        defaultValues: { payment_condition_id?: string };
      };
    };

    afterEach(() => {
      mockUseSuspenseQueries.mockImplementation(() => queries(paymentProviders));
      mockUseCapsConfigContext.mockReset();
    });

    it('leaves the installments empty and required in the current theme', () => {
      const { config, defaultValues } = renderWithTheme('current');

      expect(defaultValues.payment_condition_id).toBe('');
      expect(config.requiresPaymentCondition('HIPAY')).toBe(true);
    });

    it('only requires the schedule and the payment providers choice in the current theme', () => {
      mockUseCapsConfigContext.mockReturnValue({
        id: 'PROP001',
        content: {},
        theme: 'current',
        oidc: { issuerType: OidcIssuerTypes.GO, accessToken: 'token' },
      } as never);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        expect(() =>
          render(
            <CapsForm>
              <MockPaymentSchedule />
            </CapsForm>,
          ),
        ).toThrow('Missing required components: PaymentPanel');
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    it('keeps the first installments preselected in the legacy theme', () => {
      const { config, defaultValues } = renderWithTheme('legacy');

      expect(defaultValues.payment_condition_id).toBe('visa-1x');
      expect(config.requiresPaymentCondition('HIPAY')).toBe(false);
    });
  });
});
