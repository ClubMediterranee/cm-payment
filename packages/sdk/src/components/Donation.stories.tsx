import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { provider } from '../__fixtures__/capsFormScenarios';
import { Action } from '../__generated__/index.schemas';
import { Donation } from './Donation';

const paymentConfigHandler = (isDonationEnabled: boolean) =>
  http.get('*/rest/payment_config', () => {
    return Response.json({
      feature_flips: {
        is_donation_enabled: isDonationEnabled,
      },
      settings: {},
    });
  });

const paymentProvidersHandler = http.get('*/rest/payment_providers/booking/*', () =>
  Response.json({
    payment_providers: [provider('PAYPAL', 'Pay with PayPal')],
    buy_now_pay_later_providers: [],
  }),
);

const schedulesHandler = http.get('*/rest/payment_schedules/booking/test-booking', () => {
  return Response.json([
    {
      amount: 1000,
      deadline: '20251231',
      currency: 'EUR',
    },
  ]);
});

const defaultHandlers = [schedulesHandler, paymentProvidersHandler, paymentConfigHandler(true)];

const DonationWithProvider = ({
  defaultValues,
  action = Action.PAYMENT_RESA,
}: {
  defaultValues?: React.ComponentProps<typeof MockedProvider>['defaultValues'];
  action?: Action;
}) => {
  return (
    <MockedProvider
      bookingId="test-booking"
      customerId="test-customer"
      action={action}
      defaultValues={{ donation_amount: undefined, ...defaultValues }}
    >
      <Donation />
    </MockedProvider>
  );
};

const meta: Meta<typeof Donation> = {
  title: 'Current/Internals/Donation',
  component: Donation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant de donation permettant aux utilisateurs de faire un don à la Fondation Club Med avec des montants prédéfinis ou personnalisés, à confirmer puis à retirer.',
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

const openSection = async (canvas: ReturnType<typeof within>) => {
  const toggle = await canvas.findByRole('switch', { name: /Make a donation/i });
  await userEvent.click(toggle);
  return toggle;
};

export const Default: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          'Section repliée par défaut. Dépliée, elle propose trois montants (5, 20, 50), aucun présélectionné, « Autre montant », le consentement et `Confirmer`.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = await canvas.findByRole('switch', { name: /Make a donation/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await waitFor(() => {
      for (const amount of [/^5\s?€/, /^20\s?€/, /^50\s?€/]) {
        expect(canvas.getByRole('button', { name: amount })).toHaveAttribute(
          'aria-pressed',
          'false',
        );
      }
      expect(canvas.getByRole('checkbox', { name: 'Other amount' })).not.toBeChecked();
      expect(canvas.getByRole('checkbox', { name: /terms and conditions/i })).not.toBeChecked();
      expect(canvas.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  },
};

export const ConfirmAndRemove: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          "Choix d'un montant et du consentement, `Confirmer` puis `Retirer -{montant}`. Retirer réinitialise le montant, le consentement et replie la section.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await openSection(canvas);

    const twenty = await canvas.findByRole('button', { name: /^20\s?€/ });
    await userEvent.click(twenty);
    expect(twenty).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(canvas.getByRole('button', { name: /^50\s?€/ }));
    expect(twenty).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(canvas.getByRole('checkbox', { name: /terms and conditions/i }));
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));

    await canvas.findByRole('button', { name: /Remove -.*50\s?€/ });

    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(canvas.getByRole('button', { name: /^50\s?€/ })).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('button', { name: /Remove -.*50\s?€/ })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /Remove -.*50\s?€/ }));
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));

    await userEvent.click(toggle);
    expect(canvas.getByRole('button', { name: /^50\s?€/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(canvas.getByRole('checkbox', { name: /terms and conditions/i })).not.toBeChecked();
    expect(canvas.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  },
};

export const OtherAmount: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          '« Autre montant » désélectionne les pastilles et révèle le champ libre. Modifier un don confirmé remet `Confirmer`, sans retrait proposé.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openSection(canvas);

    const five = await canvas.findByRole('button', { name: /^5\s?€/ });
    await userEvent.click(five);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Other amount' }));
    expect(five).toHaveAttribute('aria-pressed', 'false');

    const input = canvas.getByPlaceholderText('Enter an amount');
    await userEvent.type(input, '15');
    expect(input).toHaveValue(15);

    await userEvent.click(canvas.getByRole('checkbox', { name: /terms and conditions/i }));
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
    await canvas.findByRole('button', { name: /Remove -.*15\s?€/ });

    await userEvent.clear(input);
    await userEvent.type(input, '25');
    expect(canvas.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Other amount' }));
    expect(canvas.queryByPlaceholderText('Enter an amount')).not.toBeInTheDocument();
  },
};

export const Errors: Story = {
  parameters: {
    msw: {
      handlers: defaultHandlers,
    },
    docs: {
      description: {
        story:
          "`Confirmer` sans consentement, sans montant ou avec un montant libre vide affiche l'erreur inline correspondante.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openSection(canvas);

    await userEvent.click(await canvas.findByRole('button', { name: 'Confirm' }));
    await canvas.findByText('Select an amount');
    await canvas.findByText('Please accept the terms and conditions of your donation');

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Other amount' }));
    expect(canvas.queryByText('Select an amount')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
    await canvas.findByText('Enter a valid amount');

    await userEvent.click(canvas.getByRole('checkbox', { name: /terms and conditions/i }));
    await waitFor(() =>
      expect(
        canvas.queryByText('Please accept the terms and conditions of your donation'),
      ).not.toBeInTheDocument(),
    );
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
    await openSection(canvas);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Information about donation' }),
    );

    await waitFor(() => {
      expect(canvas.getByText(/Your donation is tax deductible/i)).toBeInTheDocument();
      expect(
        canvas.getByRole('heading', { name: /Friends of the Foundation/i }),
      ).toBeInTheDocument();
    });

    const dialog = canvas.getByRole('dialog', { name: /Friends of the Foundation/i });
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    expect(closeButton).toHaveFocus();
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(canvas.queryByText(/Your donation is tax deductible/i)).not.toBeInTheDocument();
    });
  },
};

export const RemovedWithSplitPayment: Story = {
  parameters: {
    msw: {
      handlers: [
        schedulesHandler,
        http.get('*/rest/payment_providers/booking/*', () =>
          Response.json({
            payment_providers: [],
            buy_now_pay_later_providers: [
              { ...provider('ONEY', 'Pay in 3 times'), category_payment_method: 'BuyNowPayLater' },
            ],
          }),
        ),
        paymentConfigHandler(true),
      ],
    },
    docs: {
      description: {
        story:
          'Un paiement fractionné (`BuyNowPayLater`) retire le don et masque la section (BR-027).',
      },
    },
  },
  render() {
    return (
      <DonationWithProvider
        defaultValues={{ donation_amount: 20, cgv_donation: true, provider_id: 'ONEY' }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole('switch', { name: /Make a donation/i })).not.toBeInTheDocument();
    });
  },
};

export const WithoutPaymentResaAction: Story = {
  parameters: {
    msw: { handlers: defaultHandlers },
    docs: {
      description: {
        story: "Le composant ne s'affiche que pour l'action `PAYMENT_RESA`.",
      },
    },
  },
  render() {
    return <DonationWithProvider action={Action.PAYMENT_OPTION} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByText(/Make a donation/i)).not.toBeInTheDocument();
    });
  },
};

export const WithoutDonationFeature: Story = {
  parameters: {
    msw: {
      handlers: [schedulesHandler, paymentProvidersHandler, paymentConfigHandler(false)],
    },
    docs: {
      description: {
        story:
          "Le composant ne s'affiche pas si le feature flip `is_donation_enabled` est à false.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByText(/Make a donation/i)).not.toBeInTheDocument();
    });
  },
};
