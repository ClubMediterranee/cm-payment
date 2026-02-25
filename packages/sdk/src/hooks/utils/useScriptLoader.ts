import { useEffect } from 'react';

import { useDisclosure } from './useDisclosure';

type ScriptAttributes = Pick<HTMLScriptElement, 'integrity' | 'crossOrigin'>;

export const useScriptLoader = (url: string, attributes?: ScriptAttributes) => {
  const { isOpen: isLoaded, onOpen: onLoad, onClose: onError } = useDisclosure();

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${url}"]`);

    if (existingScript) {
      onLoad();
      return;
    }

    const script = Object.assign(document.createElement('script'), {
      src: url,
      async: true,
      onload: onLoad,
      onerror: onError,
      ...attributes,
    });

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [onError, onLoad, url, attributes?.integrity, attributes?.crossOrigin]);

  return { isLoaded };
};
