import { IconsProvider } from '@clubmed/trident-icons';
import Actions from '@clubmed/trident-icons/svg/Actions';
import Brand from '@clubmed/trident-icons/svg/Brand';
import ResortOutline from '@clubmed/trident-icons/svg/ResortOutline';
import Utilities from '@clubmed/trident-icons/svg/Utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

import { AuthProvider } from './AuthProvider';

const queryClient = new QueryClient();

export const RootProviders = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <IconsProvider icons={[Actions, Brand, ResortOutline, Utilities]}>{children}</IconsProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};
