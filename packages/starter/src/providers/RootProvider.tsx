import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-ui/atoms/Icons/svg/Actions';
import Brand from '@clubmed/trident-ui/atoms/Icons/svg/Brand';
import Utilities from '@clubmed/trident-ui/atoms/Icons/svg/Utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const RootProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <IconsProvider icons={[Actions, Brand, Utilities]}>{children}</IconsProvider>
    </QueryClientProvider>
  );
};
