import { render } from '@testing-library/react';
import { createPortal } from 'react-dom';

import { HostedField } from '../../components/ui/HostedField';
import { PspMountPoint } from '../../components/ui/PspMountPoint';
import hipayPaypal from '../../integrations/hipay-paypal/integration.config.js';
import hipay from '../../integrations/hipay/integration.config.js';
import type { ReactNode } from 'react';

const ID = hipay.mountPoints.cardNumber;

function renderInShadowRoot(children: ReactNode) {
  const host = document.body.appendChild(document.createElement('caps-form'));
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const view = render(createPortal(children, shadowRoot as unknown as Element));

  return { host, shadowRoot, ...view };
}

describe('PSP mount points', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the mount point in place outside a shadow root', () => {
    const { container } = render(<HostedField label="Card number" id={ID} />);

    expect(document.getElementById(ID)).toBe(container.querySelector(`#${ID}`));
    expect(container.querySelector('slot')).toBeNull();
  });

  it('renders the mount point in the light DOM of the shadow host, projected with a slot', () => {
    const { host, shadowRoot, unmount } = renderInShadowRoot(
      <HostedField label="Card number" id={ID} />,
    );

    const mountPoint = document.getElementById(ID);

    expect(mountPoint?.parentElement).toBe(host);
    expect(mountPoint?.slot).toBe(ID);
    expect(shadowRoot.querySelector(`slot[name="${ID}"]`)).not.toBeNull();
    expect(shadowRoot.querySelector(`#${ID}`)).toBeNull();

    unmount();

    expect(document.getElementById(ID)).toBeNull();
  });

  it('supports plain mount points (PayPal button, Uplift)', () => {
    const { host, shadowRoot } = renderInShadowRoot(
      <PspMountPoint id={hipayPaypal.mountPoints.button} className="h-45" />,
    );

    expect(document.getElementById('paypal-button')?.parentElement).toBe(host);
    expect(shadowRoot.querySelector('slot[name="paypal-button"]')).not.toBeNull();
  });
});
