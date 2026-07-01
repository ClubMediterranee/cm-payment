import { useEffect } from 'react';

import { useDisclosure } from './useDisclosure';

type ScriptAttributes = {
  [key: string]: string | undefined;
};

export const useScriptLoader = (url: string, attributes?: ScriptAttributes) => {
  const { isOpen: isLoaded, onOpen: onLoad, onClose: onError } = useDisclosure();

  useEffect(() => {
    if (!url) return;

    const existingScript = document.querySelector(`script[src="${url}"]`);

    if (existingScript) {
      if (existingScript.getAttribute('data-loaded') === 'true') {
        onLoad();
      } else {
        const handleLoad = () => onLoad();
        existingScript.addEventListener('load', handleLoad);
        return () => existingScript.removeEventListener('load', handleLoad);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      onLoad();
    };
    script.onerror = () => onError();

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          script.setAttribute(key, value);
        }
      });
    }

    document.body.appendChild(script);

    return () => {};
  }, [onError, onLoad, url, attributes?.integrity, attributes?.crossOrigin]);

  return { isLoaded };
};
