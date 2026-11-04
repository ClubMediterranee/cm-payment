'use client';

import { type CSSProperties, useLayoutEffect, useRef } from 'react';

import type { CapsFormSlotName } from '../shared/types';
import { registerCapsFormSlot } from './slots';

export type CapsFormSlotProps = {
  name: CapsFormSlotName;
  className?: string;
  style?: CSSProperties;
};

/**
 * Placeholder for a region of the CAPS form (donation, submit button) anywhere in the host page, such as a
 * sidebar. The region stays part of the CAPS form (same state); it renders in its own style-isolated shadow
 * root. Without a slot, the region renders inside the form.
 */
export function CapsFormSlot({ name, className, style }: CapsFormSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => registerCapsFormSlot(name, ref.current!), [name]);

  return <div ref={ref} data-caps-slot={name} className={className} style={style} />;
}
