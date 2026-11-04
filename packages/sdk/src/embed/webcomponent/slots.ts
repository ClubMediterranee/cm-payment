import type { CapsFormSlotName, CapsFormSlots } from '../shared/types';

const EMPTY_SLOTS: CapsFormSlots = Object.freeze({});

let slots: CapsFormSlots = EMPTY_SLOTS;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

/**
 * Register a host element for a region of the CAPS form. Returns the unregister function.
 * One CAPS form per page: slots are global to the page.
 */
export function registerCapsFormSlot(name: CapsFormSlotName, element: HTMLElement): () => void {
  slots = { ...slots, [name]: element };
  emit();

  return () => {
    if (slots[name] === element) {
      const { [name]: _removed, ...rest } = slots;
      slots = rest;
      emit();
    }
  };
}

export const subscribeCapsFormSlots = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const getCapsFormSlots = () => slots;

export const getServerCapsFormSlots = () => EMPTY_SLOTS;
