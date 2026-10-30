import { render, screen } from '@testing-library/react';

import { Header } from './Header';

const useTheme = vi.hoisted(() => vi.fn());
const useAppContext = vi.hoisted(() => vi.fn());
const useBackUrl = vi.hoisted(() => vi.fn());

vi.mock('../hooks/useTheme', () => ({ useTheme }));
vi.mock('../hooks/useBackUrl', () => ({ useBackUrl }));
vi.mock('../providers/AppProvider', () => ({ useAppContext }));
vi.mock('../hooks/useStay', () => ({ useStay: () => ({ stay: { productId: 'BAHA' } }) }));
vi.mock('../hooks/useProduct', () => ({
  useProduct: () => ({
    data: { title: 'Cancun', media: { immersive_image: 'https://img.clubmed.com/cancun.jpg' } },
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    useAppContext.mockReturnValue({ id: 'booking-1' });
    useBackUrl.mockReturnValue('https://clubmed.com/back');
  });

  describe('current theme', () => {
    beforeEach(() => useTheme.mockReturnValue('current'));

    it('renders the back link and the product banner', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /Retour/ }).getAttribute('href')).toBe(
        'https://clubmed.com/back',
      );
      expect(screen.getByText('Cancun')).toBeTruthy();
    });

    it('hides the back link and the banner without back url nor booking', () => {
      useBackUrl.mockReturnValue('');
      useAppContext.mockReturnValue({ id: undefined });

      render(<Header />);

      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.queryByText('Cancun')).toBeNull();
    });
  });

  describe('legacy theme', () => {
    beforeEach(() => useTheme.mockReturnValue('legacy'));

    it('renders the breadcrumb with the immersive image when a booking is set', () => {
      const { container } = render(<Header />);

      expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe(
        'https://clubmed.com/back',
      );
      expect(container.querySelector('[style*="cancun.jpg"]')).not.toBeNull();
    });

    it('renders an empty breadcrumb without back url', () => {
      useBackUrl.mockReturnValue('');

      render(<Header />);

      expect(screen.queryByRole('link', { name: 'Retour' })).toBeNull();
    });

    it('does not render the breadcrumb without booking', () => {
      useAppContext.mockReturnValue({ id: undefined });

      render(<Header />);

      expect(screen.queryByRole('link', { name: 'Retour' })).toBeNull();
    });
  });
});
