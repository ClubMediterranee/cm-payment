import { render } from '@testing-library/react';

import integration from '../integration.config.js';
import { UpliftForm } from './UpliftForm.js';

describe('UpliftForm', () => {
  afterEach(() => {
    delete (window as { Uplift?: unknown }).Uplift;
  });

  it('renders the Uplift container', () => {
    const { container } = render(<UpliftForm />);

    expect(container.querySelector(`#${integration.mountPoints.container}`)).not.toBeNull();
  });

  it('selects the Uplift payment while displayed', () => {
    const select = vi.fn();
    const deselect = vi.fn();
    (window as { Uplift?: unknown }).Uplift = { Payments: { select, deselect } };

    const { unmount } = render(<UpliftForm />);

    expect(select).toHaveBeenCalledTimes(1);
    expect(deselect).not.toHaveBeenCalled();

    unmount();

    expect(deselect).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the Uplift SDK is not loaded', () => {
    expect(() => render(<UpliftForm />).unmount()).not.toThrow();
  });
});
