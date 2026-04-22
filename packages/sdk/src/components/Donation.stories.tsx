import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Action } from '../__generated__/index.schemas';
import { Donation } from './Donation';

const defaultHandlers = [
  http.get('*/rest/payment_schedules/booking/test-booking', () => {
    return Response.json([
      {
        amount: 1000,
        deadline: '20251231',
        currency: 'EUR',
      },
    ]);
  }),
];

const DonationWithProvider = ({ isDonationEnabled = true }: { isDonationEnabled?: boolean }) => {
  return (
    <MockedProvider
      bookingId="test-booking"
      customerId="test-customer"
      action={Action.PAYMENT_OPTION}
      defaultValues={{ donation_amount: undefined }}
      paymentConfig={{
        featureFlip: {
          isDonationEnabled,
        },
      }}
    >
      <Donation />
    </MockedProvider>
  );
};

const meta: Meta<typeof Donation> = {
  title: 'Components/Donation',
  component: Donation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant de donation permettant aux utilisateurs de faire un don à la Fondation Club Med avec des montants prédéfinis ou personnalisés.',
      },
    },
  },
  loaders: [mswLoader],
  render() {
    return <DonationWithProvider />;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          'État par défaut avec montants prédéfinis (5€, 20€, 50€), montant libre et option "Pas cette fois".',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(
        canvas.getByText(/Make a donation to the Friends of the Foundation/i),
      ).toBeInTheDocument();

      const notThisTimeRadio = canvas.getByRole('radio', { name: /Not this time/i });
      expect(notThisTimeRadio).toBeChecked();

      const fiveEuroRadio = canvas.getByRole('radio', { name: /5,00/ });
      const twentyEuroRadio = canvas.getByRole('radio', { name: /20,00/ });
      const fiftyEuroRadio = canvas.getByRole('radio', { name: /50,00/ });
      const freeAmountRadio = canvas.getByRole('radio', { name: /Free amount/i });

      expect(fiveEuroRadio).toBeInTheDocument();
      expect(twentyEuroRadio).toBeInTheDocument();
      expect(fiftyEuroRadio).toBeInTheDocument();
      expect(freeAmountRadio).toBeInTheDocument();
    });
  },
};

export const WithInteractions: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          'Test de toutes les interactions : sélection des montants prédéfinis, montant libre, et retour à "Not this time".',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(
        canvas.getByText(/Make a donation to the Friends of the Foundation/i),
      ).toBeInTheDocument();
      expect(canvas.getByRole('radio', { name: /Not this time/i })).toBeChecked();
    });

    const notThisTimeRadio = canvas.getByRole('radio', { name: /Not this time/i });
    const fiveEuroRadio = canvas.getByRole('radio', { name: /5,00/ });
    const twentyEuroRadio = canvas.getByRole('radio', { name: /20,00/ });
    const fiftyEuroRadio = canvas.getByRole('radio', { name: /50,00/ });
    const freeAmountRadio = canvas.getByRole('radio', { name: /Free amount/i });

    await userEvent.click(fiveEuroRadio);
    await waitFor(() => {
      expect(fiveEuroRadio).toBeChecked();
      expect(notThisTimeRadio).not.toBeChecked();
    });

    await userEvent.click(twentyEuroRadio);
    await waitFor(() => {
      expect(twentyEuroRadio).toBeChecked();
      expect(fiveEuroRadio).not.toBeChecked();
    });

    await userEvent.click(fiftyEuroRadio);
    await waitFor(() => {
      expect(fiftyEuroRadio).toBeChecked();
      expect(twentyEuroRadio).not.toBeChecked();
    });

    await userEvent.click(freeAmountRadio);
    await waitFor(() => {
      expect(freeAmountRadio).toBeChecked();
      expect(fiftyEuroRadio).not.toBeChecked();
      expect(canvas.getByPlaceholderText('0')).toBeInTheDocument();
    });

    const input = canvas.getByPlaceholderText('0');
    await userEvent.type(input, '15');
    await waitFor(() => {
      expect(input).toHaveValue(15);
    });

    await userEvent.click(notThisTimeRadio);
    await waitFor(() => {
      expect(notThisTimeRadio).toBeChecked();
      expect(freeAmountRadio).not.toBeChecked();
      expect(canvas.queryByPlaceholderText('0')).not.toBeInTheDocument();
    });
  },
};

export const InformationModal: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          "Modale d'information sur la Fondation Club Med avec description et avantages fiscaux.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(
        canvas.getByText(/Make a donation to the Friends of the Foundation/i),
      ).toBeInTheDocument();
      const infoIcon = canvas.getByTestId('icon-Information');
      expect(infoIcon).toBeInTheDocument();
    });

    const infoIcon = canvas.getByTestId('icon-Information');
    await userEvent.click(infoIcon);

    await waitFor(() => {
      expect(canvas.getByText(/Your donation is tax deductible/i)).toBeInTheDocument();
      const modalImage = canvas.getByAltText(/Friends of the Foundation/i);
      expect(modalImage).toBeInTheDocument();
    });

    const closeButtons = canvas.getAllByRole('button', { name: /close/i });
    await userEvent.click(closeButtons[closeButtons.length - 1]);

    await waitFor(() => {
      expect(canvas.queryByText(/Your donation is tax deductible/i)).not.toBeInTheDocument();
    });
  },
};

export const WithoutDonationFeature: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story: "Le composant ne s'affiche pas si le feature flip `isDonationEnabled` est à false.",
      },
    },
  },
  render() {
    return <DonationWithProvider isDonationEnabled={false} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Vérifier que le composant ne s'affiche pas
    await waitFor(() => {
      expect(canvas.queryByText(/Make a donation/i)).not.toBeInTheDocument();
    });
  },
};
