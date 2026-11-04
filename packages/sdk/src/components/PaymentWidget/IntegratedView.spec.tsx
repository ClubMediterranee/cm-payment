import { render, screen } from '@testing-library/react';

import * as useForm from '../../hooks/utils/useForm';
import { PspProviders } from '../../types/PspProviders';
import { definePspProvider } from '../../utils/integrations/definePspProvider.js';
import { IntegratedView } from './IntegratedView';

describe('IntegratedView', () => {
  const watch = (providerId?: string) =>
    vi.spyOn(useForm, 'useWatch').mockReturnValue(providerId as never);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form registered for the selected provider', () => {
    definePspProvider({ id: PspProviders.MUPLIFT, component: () => <div>uplift form</div> });
    watch(PspProviders.MUPLIFT);

    render(<IntegratedView />);

    expect(screen.getByText('uplift form')).toBeTruthy();
  });

  it('renders nothing for a provider without form', () => {
    watch('UNKNOWN');

    const { container } = render(<IntegratedView />);

    expect(container.innerHTML).toBe('');
  });
});
