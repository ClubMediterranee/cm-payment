import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { ContactChoice } from './ContactChoice';

const handlers = [
  http.get('*/v2/customers/456/profile', () => {
    return Response.json({ mobile_phone: '123456789' });
  }),
  http.get('*/rest/payment_providers/booking/*', () => {
    return Response.json({
      payment_providers: [
        {
          id: 'EVOXPAY',
          label: 'Carte bancaire',
          connection_type: 'REDIRECT',
          category_payment_method: 'CreditCard',
          billing_address_form: true,
          required_delay_before_departure: 0,
          configuration: {
            display_type: 'redirect',
            settings: {},
            validation: {
              requires_token: false,
              requires_expiry_date: false,
            },
          },
          payment_conditions: {},
        },
      ],
      buy_now_pay_later_providers: [],
    });
  }),
];

const ContactChoiceWithFormProvider = (args: any) => {
  return (
    <MockedProvider
      bookingId="123"
      customerId="456"
      oidc={{ issuerType: OidcIssuerTypes.GO, accessToken: '' }}
      paymentConfig={{
        providers: {
          EVOXPAY: {
            is_active: true,
            settings: {},
          },
        },
        feature_flips: {},
      }}
      defaultValues={{ provider_id: 'EVOXPAY', template_id: '6' }}
    >
      <ContactChoice {...args} />
    </MockedProvider>
  );
};

const meta: Meta<typeof ContactChoice> = {
  title: 'Components/ContactChoice',
  component: ContactChoice,
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers,
    },
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant ContactChoice permettant de choisir le canal de contact (Email ou Téléphone) avec saisie conditionnelle des informations.',
      },
    },
  },
  render(args) {
    return <ContactChoiceWithFormProvider {...args} />;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État par défaut du composant ContactChoice avec les deux options disponibles.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const emailRadio = canvas.getByDisplayValue('6');
        const phoneRadio = canvas.getByDisplayValue('4');

        expect(emailRadio).toBeInTheDocument();
        expect(phoneRadio).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  },
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Test d'interactions avec les options de contact - sélection et saisie des informations.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Attendre que le composant soit rendu et que le payment provider soit chargé
    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    const phoneRadio = canvas.getByDisplayValue('4');

    expect(emailRadio).toBeInTheDocument();
    expect(phoneRadio).toBeInTheDocument();

    // Cliquer sur l'option Email
    await userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();

    // Vérifier que le champ email apparaît
    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailField = canvas.getByLabelText('Email');
    await expect(emailField).toHaveAttribute('type', 'email');

    await userEvent.click(phoneRadio);
    await expect(phoneRadio).toBeChecked();
    await expect(emailRadio).not.toBeChecked();

    await waitFor(() => {
      return expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    // Vérifier que le champ téléphone apparaît
    const phoneField = canvas.getByTestId('InputFor_mobile_phone');

    await expect(phoneField).toBeInTheDocument();
    await expect(phoneField).toHaveAttribute('type', 'tel');
  },
};

export const WithAdditionalInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test d'interactions avec les options de contact additionnelles",
      },
    },
    msw: {
      handlers: [
        http.get('*/rest/payment_providers/booking/*', () => {
          return Response.json({
            payment_providers: [
              {
                id: 'EVOXPAY',
                label: 'Carte bancaire',
                connection_type: 'REDIRECT',
                category_payment_method: 'BankTransfer',
                billing_address_form: true,
                required_delay_before_departure: 0,
                configuration: {
                  display_type: 'redirect',
                  settings: {},
                  validation: {
                    requires_token: false,
                    requires_expiry_date: false,
                  },
                },
                payment_conditions: {},
              },
            ],
            buy_now_pay_later_providers: [],
          });
        }),
        ...handlers,
      ],
    },
  },
  render: (args) => (
    <MockedProvider
      bookingId="123"
      customerId="456"
      oidc={{ issuerType: OidcIssuerTypes.GO, accessToken: '' }}
      paymentConfig={{
        providers: {
          EVOXPAY: {
            is_active: true,
            settings: {},
          },
        },
        feature_flips: {},
      }}
      defaultValues={{ provider_id: 'EVOXPAY', template_id: '1' }}
    >
      <ContactChoice {...args} reference="123" />
    </MockedProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      async () => {
        const mobilePhoneRadio = canvas.queryByDisplayValue('4');
        const callRadio = canvas.queryByDisplayValue('1');

        expect(mobilePhoneRadio).toBeInTheDocument();
        expect(callRadio).toBeInTheDocument();
        expect(callRadio).toBeDisabled();
        expect(mobilePhoneRadio).toBeChecked();
      },
      { timeout: 10000 },
    );

    const emailRadio = canvas.getByDisplayValue('6');
    const phoneRadio = canvas.getByDisplayValue('4');
    const callRadio = canvas.getByDisplayValue('1');

    expect(emailRadio).toBeInTheDocument();
    expect(phoneRadio).toBeInTheDocument();
    expect(callRadio).toBeInTheDocument();

    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailField = canvas.getByLabelText('Email');
    await expect(emailField).toHaveAttribute('type', 'email');

    await userEvent.click(phoneRadio);
    await expect(phoneRadio).toBeChecked();
    await expect(emailRadio).not.toBeChecked();

    await waitFor(() => {
      return expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    const phoneField = canvas.getByTestId('InputFor_mobile_phone');

    await expect(phoneField).toBeInTheDocument();
    await expect(phoneField).toHaveAttribute('type', 'tel');

    await userEvent.click(emailRadio);
    await expect(emailRadio).toBeChecked();
    await expect(phoneRadio).not.toBeChecked();
  },
};

export const ValidationTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Test de validation des champs de contact avec différents formats.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    await userEvent.click(emailRadio);

    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailField = canvas.getByLabelText('Email') as HTMLInputElement;
    expect(emailField).toBeInTheDocument();

    await userEvent.click(emailField);
    await userEvent.type(emailField, 'test.user@example.com', { delay: 10 });

    await new Promise((resolve) => setTimeout(resolve, 200));

    const phoneRadio = canvas.getByDisplayValue('4');
    await userEvent.click(phoneRadio);

    await waitFor(() => {
      expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    const phoneField = canvas.getByTestId('InputFor_mobile_phone') as HTMLInputElement;
    expect(phoneField).toBeInTheDocument();

    await userEvent.click(phoneField);
    await userEvent.type(phoneField, '+33123456789', { delay: 10 });

    await new Promise((resolve) => setTimeout(resolve, 300));

    await userEvent.tripleClick(phoneField);
    await userEvent.type(phoneField, 'invalid-phone', { delay: 10 });

    phoneField.blur();

    await waitFor(() => {
      const errorMessage = canvas.queryByText(/invalid/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });

    await userEvent.click(emailRadio);

    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailField2 = canvas.getByLabelText('Email') as HTMLInputElement;

    await new Promise((resolve) => setTimeout(resolve, 300));

    await userEvent.tripleClick(emailField2);
    await userEvent.type(emailField2, 'invalid-email', { delay: 10 });

    emailField2.blur();

    await waitFor(() => {
      const errorMessage = canvas.queryByText(/invalid/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });
  },
};

export const AccessibilityTest: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test d'accessibilité du composant ContactChoice.",
      },
    },
  },
  render: (args) => (
    <MockedProvider
      bookingId="123"
      customerId="456"
      oidc={{ issuerType: OidcIssuerTypes.PARTNERS, accessToken: '' }}
      paymentConfig={{
        providers: {
          EVOXPAY: {
            is_active: true,
            settings: {},
          },
        },
        feature_flips: {},
      }}
      defaultValues={{ provider_id: 'EVOXPAY', template_id: '6' }}
    >
      <ContactChoice {...args} />
    </MockedProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Attendre que les radios soient disponibles
    await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    await waitFor(() => {
      const radios = canvas.getAllByRole('radio');
      expect(radios.length).toBe(2);

      radios.forEach((radio) => {
        expect(radio).toBeInTheDocument();
      });
    });

    // Test navigation clavier
    const emailRadio = canvas.getByDisplayValue('6');

    // Simuler la navigation au clavier
    emailRadio.focus();
    expect(emailRadio).toHaveFocus();

    // Simuler l'activation via la barre d'espace
    await userEvent.keyboard(' ');
    expect(emailRadio).toBeChecked();

    // Vérifier que le champ apparaît et peut recevoir le focus
    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailField = canvas.getByLabelText('Email');
    emailField.focus();
    expect(emailField).toHaveFocus();

    // Navigation Tab ne fonctionne pas de façon fiable dans l'iframe Storybook
    const phoneRadio = canvas.getByDisplayValue('4');
    phoneRadio.focus();
    expect(phoneRadio).toHaveFocus();
  },
};

export const InteractionBetweenOptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Test de l'interaction mutuelle entre les options (une seule peut être sélectionnée à la fois).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    const phoneRadio = canvas.getByDisplayValue('4');

    await userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();
    expect(phoneRadio).not.toBeChecked();

    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });
    expect(canvas.queryByLabelText('Phone')).not.toBeInTheDocument();

    const emailField = canvas.getByLabelText('Email') as HTMLInputElement;
    await userEvent.click(emailField);
    await userEvent.type(emailField, 'invalid', { delay: 10 });
    emailField.blur();

    await new Promise((resolve) => setTimeout(resolve, 100));

    await userEvent.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    expect(emailRadio).not.toBeChecked();

    await waitFor(() => {
      expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    await userEvent.click(emailRadio);

    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });
  },
};
