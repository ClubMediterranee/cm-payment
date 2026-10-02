import {
  createElement,
  type CSSProperties,
  type PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { applyShadowStyles, getCapsStyles, injectDocumentStyles } from './styles';

export const CAPS_HOST_TAG = 'caps-form';

type ShadowHostProps = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
}>;

/**
 * Render children inside the open shadow root of a `<caps-form>` element.
 * The portal keeps the host React tree (context, props updates) while isolating the styles in both directions.
 */
export function ShadowHost({ className, style, children }: ShadowHostProps) {
  const hostRef = useRef<HTMLElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current!;
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const styles = getCapsStyles();

    applyShadowStyles(root, styles.shadowCss);
    injectDocumentStyles(styles, host.ownerDocument);

    let mountPoint = root.querySelector<HTMLElement>('[data-caps-root]');

    if (!mountPoint) {
      mountPoint = host.ownerDocument.createElement('div');
      mountPoint.setAttribute('data-caps-root', '');
      root.appendChild(mountPoint);
    }

    setContainer(mountPoint);
  }, []);

  return createElement(
    CAPS_HOST_TAG,
    { ref: hostRef, className, style },
    container ? createPortal(children, container) : null,
  );
}
