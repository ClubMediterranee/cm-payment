import { useEffect } from 'react';

import { useDisclosure } from './useDisclosure';

type ScriptAttributes = Pick<HTMLScriptElement, 'integrity' | 'crossOrigin'>;

export const useScriptLoader = (url: string, attributes?: ScriptAttributes) => {
  const { isOpen: isLoaded, onOpen: onLoad, onClose: onError } = useDisclosure();

  useEffect(() => {
    if (!url) return;

    const script =
      document.querySelector<HTMLScriptElement>(`script[src="${url}"]`) ??
      document.head.appendChild(
        Object.assign(document.createElement('script'), {
          src: url,
          async: true,
          ...attributes,
        }),
      );

    if (script.dataset.loaded === 'true') {
      onLoad();
      return;
    }

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        onLoad();
      },
      { once: true },
    );
    script.addEventListener('error', onError, { once: true });
  }, [onError, onLoad, url, attributes?.integrity, attributes?.crossOrigin]);

  return { isLoaded };
};
