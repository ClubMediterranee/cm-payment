import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { mswLoader } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { OidcIssuerTypes } from '../types/CapsSettings';
import { Comments } from './Comments';

const paymentConfigHandler = (isCommentsEnabled: boolean) =>
  http.get('*/rest/payment_config', () => {
    return Response.json({
      feature_flips: {
        is_comments_enabled: isCommentsEnabled,
      },
      settings: {},
    });
  });

const paymentProvidersHandler = (needComments: boolean) =>
  http.get('*/rest/payment_providers/booking/*', () => {
    return Response.json({
      payment_providers: [
        {
          id: 'OF',
          label: 'Offline',
          connection_type: 'Manual',
          category_payment_method: 'CreditCard',
          billing_address_form: false,
          required_delay_before_departure: 0,
          configuration: {
            display_type: 'redirect',
            settings: needComments ? { requires_comments: true } : {},
            requires_contact_choice: false,
          },
          payment_conditions: {},
        },
      ],
      buy_now_pay_later_providers: [],
    });
  });

const handlers = ({
  needComments = false,
  isCommentsEnabled = false,
}: {
  needComments?: boolean;
  isCommentsEnabled?: boolean;
}) => [paymentProvidersHandler(needComments), paymentConfigHandler(isCommentsEnabled)];

const CommentsWithProvider = () => {
  return (
    <MockedProvider
      bookingId="123"
      customerId="456"
      oidc={{ issuerType: OidcIssuerTypes.GO, accessToken: '' }}
      defaultValues={{ provider_id: 'OF' }}
    >
      <Comments />
    </MockedProvider>
  );
};

const meta: Meta<typeof Comments> = {
  title: 'Components/Comments',
  component: Comments,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bloc commentaire affiché lorsque le feature flip `is_comments_enabled` est actif ou que le provider sélectionné a le setting `requires_comments`. Le commentaire est requis (non vide) uniquement lorsque le provider a `requires_comments`.',
      },
    },
  },
  loaders: [mswLoader],
  render() {
    return <CommentsWithProvider />;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithProviderRequirement: Story = {
  parameters: {
    msw: { handlers: handlers({ needComments: true }) },
    docs: {
      description: {
        story:
          'Le provider sélectionné a le setting `requires_comments` : le bloc est affiché et le commentaire est saisissable.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = await waitFor(() => canvas.getByTestId('payment-comments'), {
      timeout: 10000,
    });

    expect(textarea).toBeInTheDocument();

    await userEvent.type(textarea, 'account to debit');
    expect(textarea).toHaveValue('account to debit');
  },
};

export const WithGlobalFeatureFlip: Story = {
  parameters: {
    msw: { handlers: handlers({ isCommentsEnabled: true }) },
    docs: {
      description: {
        story:
          "Le feature flip global `is_comments_enabled` est actif : le bloc est affiché même si le provider n'a pas `requires_comments`.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        expect(canvas.getByTestId('payment-comments')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  },
};

export const Hidden: Story = {
  parameters: {
    msw: { handlers: handlers({}) },
    docs: {
      description: {
        story:
          "Le composant ne s'affiche pas lorsque ni le feature flip `is_comments_enabled` ni le setting `requires_comments` du provider ne sont actifs.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByTestId('payment-comments')).not.toBeInTheDocument();
    });
  },
};
