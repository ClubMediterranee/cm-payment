import { fireEvent, render, waitFor } from '@testing-library/react';

import { FlowErrorFallback } from './FlowErrorFallback';

describe('FlowErrorFallback', () => {
  it('reports a flow loading error and lets the user retry', async () => {
    const onError = vi.fn();
    const resetErrorBoundary = vi.fn();
    const { getByRole } = render(
      <FlowErrorFallback error="boom" resetErrorBoundary={resetErrorBoundary} onError={onError} />,
    );

    expect(getByRole('alert').textContent).toContain('boom');
    await waitFor(() => expect(onError).toHaveBeenCalledWith(new Error('boom')));

    fireEvent.click(getByRole('button', { name: 'Réessayer' }));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('reports the original error and works without a listener', async () => {
    const onError = vi.fn();
    const error = new Error('bang');
    const { getByRole, rerender } = render(
      <FlowErrorFallback error={error} resetErrorBoundary={vi.fn()} onError={onError} />,
    );

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));

    rerender(<FlowErrorFallback error={error} resetErrorBoundary={vi.fn()} />);
    expect(getByRole('alert').textContent).toContain('bang');
  });
});
