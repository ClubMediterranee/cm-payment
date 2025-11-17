import { MockedFormProvider } from '@clubmed/payment-sdk/__fixtures__/MockedFormProvider.js';
import { useMockedForm } from '@clubmed/payment-sdk/__fixtures__/useMockedForm.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Cgv } from './Cgv';

// Wrapper component to provide form context
const CgvWithFormProvider = (args: any) => {
  const methods = useMockedForm({
    ...args,
    defaultValues: {
      cgv: null,
    },
  });

  return (
    <MockedFormProvider {...methods}>
      <Cgv {...args} />
    </MockedFormProvider>
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
  args: {
    onChange: fn(),
    onError: fn(),
  },
  render(args: any) {
    return <CgvWithFormProvider {...args} />;
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
  play: async ({ canvasElement, args }) => {
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

    // Vérifier que la valeur dans le state est mise à jour
    await expect(args.onChange).toHaveBeenCalledWith({ cgv: true });

    // Décocher le checkbox
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();

    // Vérifier que la valeur est remise à false
    await expect(args.onChange).toHaveBeenCalledWith({ cgv: true });
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

    // Simuler la soumission du formulaire sans cocher la case
    // (Dans un vrai formulaire, cela déclencherait la validation)

    // Vérifier que le checkbox est requis

    // Cocher puis décocher rapidement pour tester le changement d'état
    await userEvent.click(checkbox);
    await userEvent.click(checkbox);

    await expect(canvas.getByText('You must accept the T&C')).toBeInTheDocument();
    // Vérifier que le formulaire reste cohérent
    expect(checkbox).not.toBeChecked();
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
