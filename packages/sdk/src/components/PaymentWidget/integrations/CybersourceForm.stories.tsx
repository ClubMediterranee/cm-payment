import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../../../__fixtures__/MockedProvider';
import { CybersourceForm } from './CybersourceForm';

const meta: Meta<typeof CybersourceForm> = {
  title: 'Components/PaymentWidget/HostedFields/CybersourceForm',
  component: CybersourceForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Composant de formulaire Cybersource qui affiche les champs hébergés pour la saisie des informations de carte bancaire.
        `,
      },
    },
    msw: {
      handlers: [
        http.post('https://mock.clubmed.com/v0/payment_providers/*/request_token', () => {
          return HttpResponse.json({
            token:
              'eyJraWQiOiJ6dSIsImFsZyI6IlJTMjU2In0.eyJmbHgiOnsicGF0aCI6Ii9mbGV4L3YyL3Rva2VucyIsImRhdGEiOiJiaHdqUGYyVnlzbUVCbDk3NEV1VmFSQUFFTFdPRkVHZUNvUHFKSEVVNGJINXdmMFVuSkR4bXdwdWl2M1ZocnBQSFNCSnF6eXR5aHpDR1h3ZXQyNkYrMk5sZXp0QVhjV3BqVGpmTUwzS1l3eit5alA4MllKS0pNWEx2NnFHNEt0L3gxU2s4VjRiQnJZMkptRElxajhZQkY5V05ZVk9uN05CSkxaTzRodVF4d2dJSkdEclUzeVFMZDFqTmxTUm5VdmsxaWRVbFI4NHphazl0UkdiYUdDSE9QWlVrSWRvck16ZU9xd2JNRTBNVzNMZFlvMUo5aFJHQkt3S1Y4cWluMWlKdVVWVyIsIm9yaWdpbiI6Imh0dHBzOi8vdGVzdGZsZXguY3liZXJzb3VyY2UuY29tIiwiandrIjp7Imt0eSI6IlJTQSIsImUiOiJBUUFCIiwidXNlIjoiZW5jIiwibiI6InhiN1l3TTFGLTRnNUdSSy0wV2s3V1JoSHFMRkw5dmlSbTgxaXNvc1V1Wjk1a1owQ0hnMlo0ekRmZjFOa1pxaDBRNGRTeWVVR3dHcU8yTjVGYXJTQndRQTRyM205WmFtTDFtUlpxVllDelpyZDdac0hDcExFLXl5QnBqaGV3U0JDU3BEZTNZTDB3Y284RmYzZ3ZGUFJSMjdDWHFDaS1vRlZDeTBMdG9SUkgteFV4ZUtQT3VQMzdMRzlqcS1Odi1zU2p4aEg0eFgxNm1GbUhHaXpDY1dZeGQzYU5ucWNmaU40ZUNkYWlKOEo0NjBONnlwS3BVUkNYT2VqMXk1VTQxV2ItMVFWNFc5MXEwUlFyZUs3S2Jjc2MxdURSY054ZmQ0cng0M0hxWlRqTmRYMlg1LUdsU281cjhJbWk2Z2dwZUZIVGVtdUQ3WWM2eFZERDVHcXNHZjgyUSIsImtpZCI6IjA4UHk3aGw3aFlMVkFocVBXc1l0VmRDQ01HTFBMWnUzIn19LCJjdHgiOlt7ImRhdGEiOnsiY2xpZW50TGlicmFyeUludGVncml0eSI6InNoYTI1Ni00VFVLQmQzVk1JR0dOczFaTHpmVTZiRzBZRzRrVVNjU090UHU1ZWM3WWdvXHUwMDNkIiwiY2xpZW50TGlicmFyeSI6Imh0dHBzOi8vdGVzdGZsZXguY3liZXJzb3VyY2UuY29tL21pY3JvZm9ybS9idW5kbGUvdjIuMC4yL2ZsZXgtbWljcm9mb3JtLm1pbi5qcyIsImFsbG93ZWRDYXJkTmV0d29ya3MiOlsiVklTQSIsIk1BRVNUUk8iLCJNQVNURVJDQVJEIiwiQU1FWCIsIkRJU0NPVkVSIiwiRElORVJTQ0xVQiIsIkpDQiIsIkNVUCIsIkNBUlRFU0JBTkNBSVJFUyJdLCJjbGllbnRWZXJzaW9uIjoidjIuMCIsInRhcmdldE9yaWdpbnMiOlsiaHR0cHM6Ly9wb2QtaW50cm9kdWNlZC1jYW1waW5nLWRlcHRoLnRyeWNsb3VkZmxhcmUuY29tIl0sIm1mT3JpZ2luIjoiaHR0cHM6Ly90ZXN0ZmxleC5jeWJlcnNvdXJjZS5jb20ifSwidHlwZSI6Im1mLTIuMC4wIn1dLCJpc3MiOiJGbGV4IEFQSSIsImV4cCI6MTc2OTYwNjQ5OCwiaWF0IjoxNzY5NjA1NTk4LCJqdGkiOiJFTDhUWW9hT3R4eW94emVTIn0.V2XJPr0nnS8m-YRMx6vkiyEQkFVcIA1Z_mprn58GDQEv6_vcL6U-jnUnpfBqNFOYVeDwCR9RqotlRZui8ZQ79oEHcMQpn1twI8KAgj54Gurcmcn3nPt0VyQQ30ZxXxbfY49Up5nf0ezys-TOIG7sFwQKkzSlxQAnFCTRxCBHONLG_PyZ6yacER4Sh29SiTeOpewrdiogYc-zX4kp4eJzqDPBKblBDbJ8_lQh4bINzSeKkDeOzDtGyL-AmQ5bNOsGeKEM_T_qGDumYVxrcGNaQZMoj04oPre1uDN3LDaTZd_3urOZ7CcJxCE6V7faMBJypSdlmel4o5jI5ItzrHvE7g',
          });
        }),
      ],
    },
  },
  render() {
    return (
      <MockedProvider
        defaultValues={{
          token: { value: '', status: 'idle' },
        }}
        proposalId="12345678"
      >
        <CybersourceForm />
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
        story: "Test complet du chargement : vérifie d'abord l'état de chargement avec animation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Card number')).toBeInTheDocument();
    });

    expect(canvas.getByText('Expiry date')).toBeInTheDocument();
    expect(canvas.getByText('Security code')).toBeInTheDocument();

    const hostedFieldContainers = canvasElement.querySelectorAll('[id^="cybersource-card-"]');

    const loadingFields = canvasElement.querySelectorAll('.animate-pulsation');
    if (loadingFields.length > 0) {
      expect(loadingFields.length).toBe(3);

      loadingFields.forEach((field) => {
        expect(field).toHaveClass('pointer-events-none');
        expect(field).toHaveClass('bg-lightGrey');
      });

      hostedFieldContainers.forEach((container) => {
        const iframe = container.querySelector('iframe');
        expect(iframe).not.toBeInTheDocument();
      });
    }

    const cardNumberDiv = canvasElement.querySelector('#cybersource-card-number');
    const cvcDiv = canvasElement.querySelector('#cybersource-card-cvc');

    expect(cardNumberDiv).toBeInTheDocument();
    expect(cvcDiv).toBeInTheDocument();
  },
};
