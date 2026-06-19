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

// Wrapper component with donation to test the donation CGV checkbox
const CgvWithDonationProvider = () => {
  return (
    <MockedProvider
      bookingId="test-booking"
      customerId="test-customer"
      defaultValues={{ cgv: false, donation_amount: 20, cgv_donation: false }}
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

    // Vérifier que le texte des CGV est présent
    await waitFor(() => {
      expect(canvas.getByText(/Validating my reservation implies/)).toBeInTheDocument();
    });

    // Trouver le checkbox principal CGV
    const checkboxes = canvas.getAllByRole('checkbox');
    const cgvCheckbox = checkboxes[0]; // Le premier checkbox est celui des CGV
    await expect(cgvCheckbox).toBeInTheDocument();
    await expect(cgvCheckbox).not.toBeChecked();

    // Cliquer sur le checkbox pour le cocher
    await userEvent.click(cgvCheckbox);
    await expect(cgvCheckbox).toBeChecked();

    // Décocher le checkbox
    await userEvent.click(cgvCheckbox);
    await expect(cgvCheckbox).not.toBeChecked();
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

    // Attendre que le composant soit rendu
    await waitFor(() => {
      expect(canvas.getByText(/Validating my reservation implies/)).toBeInTheDocument();
    });

    // Vérifier que le checkbox est accessible via le clavier
    const checkboxes = canvas.getAllByRole('checkbox');
    const checkbox = checkboxes[0]; // Le premier checkbox est celui des CGV

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

export const WithDonation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'État du composant CGV avec une donation active - affiche une checkbox supplémentaire pour accepter les CGV de la donation.',
      },
    },
  },
  render() {
    return <CgvWithDonationProvider />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Attendre que le composant soit rendu
    await waitFor(() => {
      expect(canvas.getByText(/Validating my reservation implies/)).toBeInTheDocument();
    });

    // Vérifier que les deux checkboxes sont présents (CGV principale + CGV donation)
    const checkboxes = canvas.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    const cgvCheckbox = checkboxes[0];
    const donationCgvCheckbox = checkboxes[1];

    // Vérifier que les deux checkboxes ne sont pas cochées par défaut
    expect(cgvCheckbox).not.toBeChecked();
    expect(donationCgvCheckbox).not.toBeChecked();

    // Vérifier que le texte de la CGV donation est présent
    expect(canvas.getByText(/I accept the donation terms and conditions/)).toBeInTheDocument();

    // Cocher la CGV principale
    await userEvent.click(cgvCheckbox);
    expect(cgvCheckbox).toBeChecked();

    // Cocher la CGV donation
    await userEvent.click(donationCgvCheckbox);
    expect(donationCgvCheckbox).toBeChecked();

    // Vérifier que les deux restent cochées
    expect(cgvCheckbox).toBeChecked();
    expect(donationCgvCheckbox).toBeChecked();

    // Décocher la CGV donation
    await userEvent.click(donationCgvCheckbox);
    expect(donationCgvCheckbox).not.toBeChecked();
    expect(cgvCheckbox).toBeChecked(); // La CGV principale reste cochée
  },
};
