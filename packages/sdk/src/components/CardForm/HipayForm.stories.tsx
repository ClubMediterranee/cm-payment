import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../../__fixtures__/MockedProvider';
import { useFormContext } from '../../hooks/utils/useForm';
import { HipayForm } from './HipayForm';

const HipayFormWithSubmit = () => {
  const { handleSubmit } = useFormContext();

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HipayForm />
      <button type="submit" data-testid="hidden-submit-button" style={{ display: 'none' }}>
        Submit
      </button>
    </form>
  );
};

const meta: Meta<typeof HipayForm> = {
  title: 'Components/CardForm/HipayForm',
  component: HipayForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Composant de formulaire Hipay qui affiche les champs hébergés pour la saisie des informations de carte bancaire.
        `,
      },
    },
  },
  render() {
    return (
      <MockedProvider
        defaultValues={{
          token: '',
        }}
        proposalId="12345678"
      >
        <HipayForm />
      </MockedProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État par défaut du formulaire Hipay avec les 4 champs de carte bancaire.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Card details')).toBeInTheDocument();
    });

    expect(canvas.getByText('Card number')).toBeInTheDocument();
    expect(canvas.getByText('Cardholder name')).toBeInTheDocument();
    expect(canvas.getByText('Expiry date')).toBeInTheDocument();
    expect(canvas.getByText('Security code')).toBeInTheDocument();

    const hostedFields = canvasElement.querySelectorAll('[id^="hipay-"]');
    expect(hostedFields.length).toBe(4);
  },
};

export const LoadingIframeTest: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Test complet du chargement : vérifie d'abord l'état de chargement avec animation, puis attend que le SDK Hipay charge et vérifie la création des 4 iframes hébergées.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Card details')).toBeInTheDocument();
    });

    expect(canvas.getByText('Card number')).toBeInTheDocument();
    expect(canvas.getByText('Cardholder name')).toBeInTheDocument();
    expect(canvas.getByText('Expiry date')).toBeInTheDocument();
    expect(canvas.getByText('Security code')).toBeInTheDocument();

    const hostedFieldContainers = canvasElement.querySelectorAll('[id^="hipay-"]');
    expect(hostedFieldContainers.length).toBe(4);

    const loadingFields = canvasElement.querySelectorAll('.animate-pulsation');
    if (loadingFields.length > 0) {
      expect(loadingFields.length).toBe(4);

      loadingFields.forEach((field) => {
        expect(field).toHaveClass('pointer-events-none');
        expect(field).toHaveClass('bg-lightGrey');
      });

      hostedFieldContainers.forEach((container) => {
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeInTheDocument();
      });
    }

    const cardNumberDiv = canvasElement.querySelector('#hipay-card-number');
    const cardHolderDiv = canvasElement.querySelector('#hipay-card-holder');
    const expiryDateDiv = canvasElement.querySelector('#hipay-card-expiry');
    const cvcDiv = canvasElement.querySelector('#hipay-card-cvc');

    expect(cardNumberDiv).toBeInTheDocument();
    expect(cardHolderDiv).toBeInTheDocument();
    expect(expiryDateDiv).toBeInTheDocument();
    expect(cvcDiv).toBeInTheDocument();

    await waitFor(
      () => {
        const iframes = canvasElement.querySelectorAll('iframe');
        expect(iframes.length).toBe(4);

        expect(cardNumberDiv?.querySelector('iframe')).toBeInTheDocument();
        expect(cardHolderDiv?.querySelector('iframe')).toBeInTheDocument();
        expect(expiryDateDiv?.querySelector('iframe')).toBeInTheDocument();
        expect(cvcDiv?.querySelector('iframe')).toBeInTheDocument();

        iframes.forEach((iframe) => {
          expect(iframe.src).toContain('hipay');
        });
      },
      { timeout: 10000 },
    );
  },
};

export const ErrorTest: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Test de soumission du formulaire : attend le chargement des iframes Hipay, attend que le SDK soit complètement prêt, puis soumet automatiquement le formulaire vide. Hipay devrait retourner des erreurs de validation sur getPaymentData() qui seront affichées.',
      },
    },
  },
  render() {
    return (
      <MockedProvider
        defaultValues={{
          token: '',
        }}
        proposalId="12345678"
      >
        <HipayFormWithSubmit />
      </MockedProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const loadingFields = canvasElement.querySelectorAll('.animate-pulsation');
        expect(loadingFields.length).toBe(0);
      },
      { timeout: 10000 },
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const submitButton = canvas.getByTestId('hidden-submit-button');
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        const errorAlerts = canvas.queryAllByRole('alert');
        expect(errorAlerts.length).toBeGreaterThan(0);

        errorAlerts.forEach((alert) => {
          expect(alert).toHaveClass('text-red');
          expect(alert.textContent).toBeTruthy();
        });
      },
      { timeout: 10000 },
    );
  },
};
