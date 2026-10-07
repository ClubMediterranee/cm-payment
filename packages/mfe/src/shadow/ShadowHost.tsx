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
}>;

export function ShadowHost({ className, style, children }: ShadowHostProps) {
  const hostRef = useRef<HTMLElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setContainer(mountShadowRoot(hostRef.current!));
  }, []);

  return createElement(
    CAPS_HOST_TAG,
    { ref: hostRef, className, style },
    container ? createPortal(children, container) : null,
  );
}

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
