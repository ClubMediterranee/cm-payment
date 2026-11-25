export const mapIxopayErrorsToObject = (
  ixopayErrors: Array<{ attribute: string; message: string }>,
): Record<string, string> => {
  return ixopayErrors.reduce(
    (acc, { attribute, message }) => ({ ...acc, [attribute]: message }),
    {},
  );
};
