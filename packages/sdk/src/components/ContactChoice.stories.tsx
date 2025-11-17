import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { ContactChoice } from './ContactChoice';

// Note: We cannot mock GLOBAL_CAPS_SETTINGS in Storybook stories
// The component will use the real configuration from '@clubmed/payment-sdk/config'

// Wrapper component to provide form context

initialize();

const handlers = [
  http.get('*/v2/customers/456/profile', () => {
    return Response.json({ mobile_phone: '123456789' });
  }),
  http.get('*/v1/payment_providers', () => {
    return Response.json([
      {
        id: 'EVOXPAY',
        label: 'Carte bancaire',
        connection_type: 'REDIRECT',
        category_payment_method: 'CreditCard',
        billing_address_form: true,
        required_delay_before_departure: 0,
      },
    ]);
  }),
];

const ContactChoiceWithFormProvider = (args: any) => {
  return (
    <MockedProvider
      bookingId="123"
      customerId="456"
      oidc={{ issuerType: OidcIssuerTypes.GO, accessToken: '' }}
      featureFlips={{
        'featureFlipping.seller.psp.evoxpay': true,
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
    await expect(phoneField).toHaveAttribute('type', 'phone');
  },
};

export const WithAdditionalInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test d'interactions avec les options de contact additionnelles",
      },
    },
  },
  render: (args) => <ContactChoiceWithFormProvider {...args} reference="123" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Attendre que le composant soit rendu et que le payment provider soit chargé
    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    const callRadio = canvas.getByDisplayValue('1');
    const phoneRadio = canvas.getByDisplayValue('4');

    expect(emailRadio).toBeInTheDocument();
    expect(phoneRadio).toBeInTheDocument();
    expect(callRadio).toBeInTheDocument();

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
    await expect(phoneField).toHaveAttribute('type', 'phone');

    await userEvent.click(callRadio);
    await expect(callRadio).toBeChecked();
    await expect(emailRadio).not.toBeChecked();
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

    // Attendre que les radios soient disponibles
    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    // Sélectionner l'option email
    await userEvent.click(emailRadio);

    // Attendre que le champ email apparaisse
    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });

    // Tester la saisie d'un email
    const emailField = canvas.getByLabelText('Email') as HTMLInputElement;
    expect(emailField).toBeInTheDocument();

    // Cliquer sur le champ email et saisir
    await userEvent.click(emailField);
    await userEvent.type(emailField, 'test.user@example.com', { delay: 10 });

    // Attendre que la saisie se termine
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Changer pour téléphone
    const phoneRadio = canvas.getByDisplayValue('4');
    await userEvent.click(phoneRadio);

    await waitFor(() => {
      expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    // Tester la saisie d'un numéro de téléphone
    const phoneField = canvas.getByTestId('InputFor_mobile_phone') as HTMLInputElement;
    expect(phoneField).toBeInTheDocument();

    // Cliquer sur le champ téléphone et saisir
    await userEvent.click(phoneField);
    await userEvent.type(phoneField, '+33123456789', { delay: 10 });

    // Attendre que la saisie se termine
    await new Promise((resolve) => setTimeout(resolve, 200));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Attendre que les radios soient disponibles
    await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    // Vérifier que le titre est un heading
    await waitFor(() => {
      const heading = canvas.getByRole('heading', { name: /What type of channel/ });
      expect(heading).toBeInTheDocument();
    });

    // Vérifier que les radios sont accessibles
    const radios = canvas.getAllByRole('radio');
    expect(radios.length).toBe(2);

    radios.forEach((radio) => {
      expect(radio).toBeInTheDocument();
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

    // Attendre que les radios soient disponibles
    const emailRadio = await waitFor(
      () => {
        return canvas.getByDisplayValue('6');
      },
      { timeout: 10000 },
    );

    const phoneRadio = canvas.getByDisplayValue('4');

    // Sélectionner email
    await userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();
    expect(phoneRadio).not.toBeChecked();

    // Vérifier que le champ email est visible
    await waitFor(() => {
      expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    });
    expect(canvas.queryByLabelText('Phone')).not.toBeInTheDocument();

    // Changer pour téléphone
    await userEvent.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    expect(emailRadio).not.toBeChecked();

    // Vérifier que le champ téléphone est maintenant visible
    await waitFor(() => {
      expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });
  },
};
