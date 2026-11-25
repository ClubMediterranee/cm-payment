import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, screen, waitFor } from '@testing-library/react';
import { type PropsWithChildren, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { content } from '../__fixtures__/content';
import { defaultAppContent, useContent } from './useContent';

const getPaymentContent = vi.hoisted(() => vi.fn());

vi.mock('../__generated__/bff', () => ({
  paymentContentControllerGetPaymentContent: getPaymentContent,
}));

vi.mock('../providers/AppProvider', () => ({
  useAppContext: () => ({
    api: { url: 'https://caps.example', apiKey: 'key' },
    values: { locale: 'fr-FR' },
  }),
}));

const renderContent = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <ErrorBoundary fallbackRender={({ error }) => <p role="alert">{String(error)}</p>}>
        <Suspense fallback={null}>{children}</Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );

  return renderHook(() => useContent(), { wrapper });
};

describe('useContent', () => {
  it('splits the app content from the form content', async () => {
    getPaymentContent.mockResolvedValue({ ...content.content, app: content.app });

    const { result } = renderContent();

    await waitFor(() => expect(result.current).toEqual(content));
  });

  it('falls back to the default app content when a template is malformed', async () => {
    getPaymentContent.mockResolvedValue({
      ...content.content,
      app: { ...content.app, stay: { ...content.app.stay, dates: 'From {start}' } },
    });

    const { result } = renderContent();

    await waitFor(() =>
      expect(result.current).toEqual({ app: defaultAppContent, content: content.content }),
    );
  });

  it('falls back to the default content when caps_content is unavailable', async () => {
    getPaymentContent.mockRejectedValue(new Error('Internal Server Error'));

    const { result } = renderContent();

    await waitFor(() => expect(result.current).toEqual({ app: defaultAppContent, content: {} }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
