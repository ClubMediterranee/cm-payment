import { render } from '@testing-library/react';

import { CapsFormSlot } from './CapsFormSlot';
import { getCapsFormSlots, registerCapsFormSlot } from './slots';

describe('CapsFormSlot', () => {
  it('registers its element while mounted', () => {
    const { container, unmount } = render(
      <CapsFormSlot name="donation" className="sidebar-donation" />,
    );
    const element = container.querySelector('[data-caps-slot="donation"]');

    expect(element?.className).toBe('sidebar-donation');
    expect(getCapsFormSlots().donation).toBe(element);

    unmount();

    expect(getCapsFormSlots()).not.toHaveProperty('donation');
  });

  it('keeps the latest registration when an older slot unregisters', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');

    const unregisterFirst = registerCapsFormSlot('submit', first);
    const unregisterSecond = registerCapsFormSlot('submit', second);
    unregisterFirst();

    expect(getCapsFormSlots().submit).toBe(second);

    unregisterSecond();

    expect(getCapsFormSlots()).not.toHaveProperty('submit');
  });
});
