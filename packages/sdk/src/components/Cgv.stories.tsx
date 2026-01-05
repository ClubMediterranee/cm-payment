import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { MockedProvider } from '../__fixtures__/MockedProvider';
import { Cgv } from './Cgv';

// Wrapper component to provide form context
const CgvWithFormProvider = () => {
  return (
    <MockedProvider
      bookingId="test-booking"
      customerId="test-customer"
      defaultValues={{ cgv: false }}
    >
      <Cgv />
    </MockedProvider>
  );
};

const meta: Meta<typeof Cgv> = {
  title: 'Components/Cgv',
  component: Cgv,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composant CGV (Conditions Générales de Vente) avec checkbox de validation obligatoire.',
      },
    },
  },
  render() {
    return <CgvWithFormProvider />;
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'État par défaut du composant CGV avec checkbox non cochée.',
      },
    },
  },
};

export const WithInteractions: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test d'interactions avec le checkbox CGV - validation et gestion des erreurs.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Vérifier que le composant est rendu
    expect(canvas.getByText('Terms and Conditions')).toBeInTheDocument();

    // Trouver le checkbox
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();

    // Vérifier que le texte des CGV est présent
    await expect(canvas.getByText(/Validating my reservation implies/)).toBeInTheDocument();

    // Cliquer sur le checkbox pour le cocher
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    // Décocher le checkbox
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const ValidationTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Test de validation du formulaire - vérification des erreurs de validation.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Trouver le checkbox
    const checkbox = canvas.getByRole('checkbox');

    // Cocher puis décocher pour laisser le champ dans un état invalide
    await userEvent.click(checkbox);
    await userEvent.click(checkbox);

    // Vérifier que le checkbox n'est pas coché
    expect(checkbox).not.toBeChecked();

    // Soumettre le formulaire pour déclencher la validation
    const form = document.getElementById('mocked-form');
    if (form) {
      fireEvent.submit(form);
    }

    // Attendre que le message d'erreur apparaisse
    await waitFor(() => {
      expect(canvas.getByText('You must accept the T&C')).toBeInTheDocument();
    });
  },
};

export const AccessibilityTest: Story = {
  parameters: {
    docs: {
      description: {
        story: "Test d'accessibilité du composant CGV.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Vérifier que le titre est un heading
    const heading = canvas.getByRole('heading', { name: /Terms and Conditions/ });
    expect(heading).toBeInTheDocument();

    // Vérifier que le checkbox est accessible via le clavier
    const checkbox = canvas.getByRole('checkbox');

    // Simuler la navigation au clavier
    checkbox.focus();
    expect(checkbox).toHaveFocus();

    // Simuler l'activation via la barre d'espace
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();

    // Désactiver via la barre d'espace
    await userEvent.keyboard(' ');
    expect(checkbox).not.toBeChecked();
  },
};
