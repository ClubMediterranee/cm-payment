import type { CapsFormSlots } from '@clubmed/caps';
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

export function useShadowSlots(slots?: CapsFormSlots): CapsFormSlots {
  const [containers, setContainers] = useState<CapsFormSlots>({});
  const { donation, submit } = slots ?? {};

  useLayoutEffect(() => {
    setContainers({
      donation: donation ? mountShadowRoot(donation) : undefined,
      submit: submit ? mountShadowRoot(submit) : undefined,
    });
  }, [donation, submit]);

  return containers;
}
