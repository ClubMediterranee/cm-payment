import {
  createElement,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { applyShadowStyles, getCapsStyles, injectDocumentStyles } from './styles';

export const CAPS_HOST_TAG = 'caps-form';

/**
 * Open (or reuse) the shadow root of `host`, apply the CAPS styles and return its mount point.
 */
export function mountShadowRoot(host: HTMLElement): HTMLElement {
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

  return mountPoint;
}

type ShadowHostProps = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  onMount?: (container: HTMLElement) => void;
}>;

/**
 * Render children inside the open shadow root of a `<caps-form>` element.
 * The portal keeps the host React tree (context, props updates) while isolating the styles in both directions.
 */
export function ShadowHost({ className, style, onMount, children }: ShadowHostProps) {
  const hostRef = useRef<HTMLElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const mountPoint = mountShadowRoot(hostRef.current!);

    setContainer(mountPoint);
    onMount?.(mountPoint);
  }, []);

  return createElement(
    CAPS_HOST_TAG,
    { ref: hostRef, className, style },
    container ? createPortal(children, container) : null,
  );
}

/**
 * Render children in the shadow root of a host element (`CapsFormSlot`), or in place without target.
 * The children stay in the CAPS React tree: form state and contexts are shared with the form.
 */
export function ShadowSlot({ target, children }: { target?: HTMLElement; children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setContainer(target ? mountShadowRoot(target) : null);
  }, [target]);

  if (!target) {
    return <>{children}</>;
  }

  return container ? createPortal(children, container) : null;
}
