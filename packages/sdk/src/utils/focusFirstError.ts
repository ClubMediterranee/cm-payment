export const focusFirstError = (root: ParentNode) => {
  requestAnimationFrame(() => {
    const hostedField = root.querySelector('[data-testid="FormControlError"]')?.closest('fieldset');

    hostedField?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center',
    });
  });
};
