import { MockedFormProvider } from '@clubmed/payment-sdk/__fixtures__/MockedFormProvider.js';
import { PspProviders } from '@clubmed/payment-sdk/types/PspProviders.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';

import { useMockedForm } from '../__fixtures__/useMockedForm';
import { ContactChoice } from './ContactChoice';

// Note: We cannot mock GLOBAL_SDK_SETTINGS in Storybook stories
// The component will use the real configuration from '@clubmed/payment-sdk/config'

// Wrapper component to provide form context
const ContactChoiceWithFormProvider = (args: any) => {
  const methods = useMockedForm({
    ...args,
    defaultValues: {
      template_id: '',
      provider_id: [PspProviders.EIXOPAY], // Mock provider that matches withContactMethodProviders
      billing_details: {
        email: '',
        mobile_phone: '',
      },
    },
  });

  return (
    <MockedFormProvider {...methods}>
      <ContactChoice {...args} />
    </MockedFormProvider>
  );
};

const meta: Meta<typeof ContactChoice> = {
  title: 'Components/ContactChoice',
  component: ContactChoice,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant ContactChoice permettant de choisir le canal de contact (Email ou Téléphone) avec saisie conditionnelle des informations.',
      },
    },
  },
  args: {
    onChange: fn(),
    onError: fn(),
  } as any,
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
  args: {},
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const { onChange } = args as any;

    // Vérifier que le composant est rendu
    await waitFor(() => {
      expect(canvas.getByText('What type of channel?')).toBeInTheDocument();
    });

    // Vérifier la présence des deux options
    // await expect(canvas.getByText((content, element) => {
    //   return element?.textContent === 'Par Email';
    // })).toBeInTheDocument();
    // await expect(canvas.getByText((content, element) => {
    //   return element?.textContent === 'Par Téléphone';
    // })).toBeInTheDocument();

    // Trouver les radio buttons
    const emailRadio = canvas.getByDisplayValue('6');
    const phoneRadio = canvas.getByDisplayValue('8');

    expect(emailRadio).toBeInTheDocument();
    expect(phoneRadio).toBeInTheDocument();

    // Vérifier qu'aucun radio n'est coché initialement
    expect(emailRadio).not.toBeChecked();
    expect(phoneRadio).not.toBeChecked();

    // Cliquer sur l'option Email
    await userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();

    mocked(onChange).mockReset();

    // Vérifier que le champ email apparaît
    const emailField = canvas.getByLabelText('Email');
    await expect(emailField).toBeInTheDocument();
    await expect(emailField).toHaveAttribute('type', 'email');

    await userEvent.type(emailField, 'test@example.com');

    await expect(onChange).toHaveBeenCalledWith({
      billing_details: {
        email: 'test@example.com',
        mobile_phone: '',
      },
      provider_id: ['EIXOPAY'],
      template_id: '6',
    });

    // Changer pour l'option téléphone
    await userEvent.click(phoneRadio);
    await expect(phoneRadio).toBeChecked();
    await expect(emailRadio).not.toBeChecked();

    await waitFor(() => {
      return expect(canvas.getByTestId('InputFor_mobile_phone')).toBeInTheDocument();
    });

    // Vérifier que le champ téléphone apparaît et que le champ email disparaît
    const phoneField = canvas.getByTestId('InputFor_mobile_phone');

    await expect(phoneField).toBeInTheDocument();
    await expect(phoneField).toHaveAttribute('type', 'phone');
    await expect(canvas.queryByLabelText('Email')).not.toBeInTheDocument();

    // Saisir un numéro de téléphone
    await userEvent.type(phoneField, '+33123456789');
    await expect(phoneField).toHaveValue('+33123456789');

    await expect(onChange).toHaveBeenCalledWith({
      billing_details: {
        email: 'test@example.com',
        mobile_phone: '+33123456789',
      },
      provider_id: ['EIXOPAY'],
      template_id: '8',
    });
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

    // Sélectionner l'option email
    const emailRadio = canvas.getByDisplayValue('6');
    await userEvent.click(emailRadio);

    // Tester la saisie d'un email valide
    const emailField = canvas.getByLabelText('Email');
    await userEvent.type(emailField, 'valid@example.com');
    expect(emailField).toHaveValue('valid@example.com');

    // Effacer et tester un email invalide
    await userEvent.clear(emailField);
    await userEvent.type(emailField, 'invalid-email');
    expect(emailField).toHaveValue('invalid-email');

    // Changer pour téléphone
    const phoneRadio = canvas.getByDisplayValue('8');
    await userEvent.click(phoneRadio);

    const phoneField = canvas.getByTestId('InputFor_mobile_phone');
    await userEvent.type(phoneField, '0123456789');

    expect(phoneField).toHaveValue('0123456789');
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

    // Vérifier que le titre est un heading
    const heading = canvas.getByRole('heading', { name: /What type of channel/ });
    expect(heading).toBeInTheDocument();

    // Vérifier que les radios sont accessibles
    const radios = canvas.getAllByRole('radio');
    expect(radios).toHaveLength(2);

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
    const emailField = canvas.getByLabelText('Email');
    emailField.focus();
    expect(emailField).toHaveFocus();

    // Navigation Tab ne fonctionne pas de façon fiable dans l'iframe Storybook
    const phoneRadio = canvas.getByDisplayValue('8');
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const emailRadio = canvas.getByDisplayValue('6');
    const phoneRadio = canvas.getByDisplayValue('8');

    // Sélectionner email
    await userEvent.click(emailRadio);
    expect(emailRadio).toBeChecked();
    expect(phoneRadio).not.toBeChecked();

    // Vérifier que le champ email est visible
    expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    expect(canvas.queryByLabelText('Phone')).not.toBeInTheDocument();

    // Saisir une valeur dans le champ email
    const emailField = canvas.getByLabelText('Email');
    await userEvent.type(emailField, 'test@example.com');

    // Changer pour téléphone
    await userEvent.click(phoneRadio);
    expect(phoneRadio).toBeChecked();
    expect(emailRadio).not.toBeChecked();

    // Vérifier que le champ téléphone est maintenant visible et l'email caché
    // expect(canvas.getByLabelText('Téléphone')).toBeInTheDocument();
    // expect(canvas.queryByLabelText('Email')).not.toBeInTheDocument();

    // Vérifier que les données précédentes de l'email sont conservées dans le state
    await expect((args as any).onChange).toHaveBeenCalledWith({
      billing_details: {
        email: 'test@example.com',
        mobile_phone: '',
      },
      provider_id: ['EIXOPAY'],
      template_id: '8',
    });
  },
};
