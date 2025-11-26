import { useEffect } from 'react';

import { useDisclosure } from './useDisclosure';

export const useScriptLoader = (url: string) => {
  const { isOpen: isLoaded, onOpen: onLoad, onClose: onError } = useDisclosure();

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${url}"]`);

    if (existingScript) {
      onLoad();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [onError, onLoad, url]);

  return { isLoaded };
};
