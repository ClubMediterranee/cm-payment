import { render } from '@testing-library/react';

import { defaultContent } from '../../../content/default';
import { WeChatButton } from './WeChatButton.js';

const state = vi.hoisted(() => ({ url: undefined as string | undefined }));

vi.mock('../../../hooks/utils/useCapsConfigContext.js', () => ({
  useCapsConfigContext: () => ({ content: defaultContent }),
}));
vi.mock('../hooks/useWeChatQRCode.js', () => ({
  useWeChatQRCode: () => ({ url: state.url }),
}));

describe('WeChatButton', () => {
  beforeEach(() => {
    state.url = undefined;
  });

  it('invites to continue to the QR code', () => {
    const { getByRole } = render(<WeChatButton className="self-center" />);

    const button = getByRole('button', { name: 'Continue' });
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.getAttribute('form')).toBe('payment-form');
    expect(button.classList).toContain('self-center');
  });

  it('hides while the QR code is shown', () => {
    state.url = 'weixin://pay/qr';

    const { container } = render(<WeChatButton />);

    expect(container.innerHTML).toBe('');
  });
});
