import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { useDisclosure } from './utils/useDisclosure';

export const useTokenRetry = ({ onRetry }: { onRetry: () => void }) => {
  const tokenStatus = useWatch({ name: 'token.status' });
  const { isOpen: shouldRetry, onOpen: enableRetry, onClose: disableRetry } = useDisclosure();

  useEffect(() => {
    if (!shouldRetry) return;

    if (tokenStatus === 'success') {
      onRetry();
    }

    if (tokenStatus !== 'pending') {
      disableRetry();
    }
  }, [tokenStatus, shouldRetry, onRetry, disableRetry]);

  const handleTokenValidationError = (errors: any) => {
    const hasUniqueError = Object.keys(errors).length === 1;

    if (hasUniqueError && errors.token?.value && tokenStatus === 'pending') {
      enableRetry();
    }
  };

  return { handleTokenValidationError };
};
