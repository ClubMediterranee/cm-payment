import { useEffect } from 'react';

import { useDisclosure } from './utils/useDisclosure';
import { useWatch } from './utils/useForm';

export const useTokenRetry = ({ onRetry }: { onRetry: () => void }) => {
  const tokenStatus = useWatch('token.status');
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

    const hasUniqueTokenError = hasUniqueError && errors.token?.value;

    if (hasUniqueTokenError && tokenStatus && ['pending', 'idle'].includes(tokenStatus)) {
      enableRetry();
    }
  };

  return { handleTokenValidationError };
};
