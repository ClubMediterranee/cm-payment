import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

export const sdkQueryClient = new QueryClient();

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <TanStackQueryClientProvider client={sdkQueryClient}>{children}</TanStackQueryClientProvider>
  );
};
