import { useLayoutEffect, useRef, useState } from 'react';

const LIGHT_DOM_STYLE = 'display:block;width:100%;height:100%;flex:1 1 auto;';

/**
 * Make a PSP mount point reachable from `document`. PSP SDKs resolve their containers with
 * `document.querySelector`, which cannot see inside a shadow root: when the element holding `ref` lives in a
 * shadow root, `<div id slot>` is appended to the shadow host (light DOM) and `slotted` is true: render
 * `<slot name={id} />` where the PSP UI must appear. Outside a shadow root, render the element with the id.
 */
export function usePspMountPoint<T extends HTMLElement = HTMLDivElement>(id?: string) {
  const ref = useRef<T>(null);
  const [slotted, setSlotted] = useState(false);

  // Layout effect: the element exists before the PSP hooks initialise their SDK in effects.
  useLayoutEffect(() => {
    const root = ref.current?.getRootNode();

    if (!id || typeof ShadowRoot === 'undefined' || !(root instanceof ShadowRoot)) {
      return;
    }

    const mountPoint = root.host.ownerDocument.createElement('div');
    mountPoint.id = id;
    mountPoint.slot = id;
    mountPoint.style.cssText = LIGHT_DOM_STYLE;
    root.host.appendChild(mountPoint);
    setSlotted(true);

    return () => {
      mountPoint.remove();
      setSlotted(false);
    };
  }, [id]);

  return { ref, slotted };
}
