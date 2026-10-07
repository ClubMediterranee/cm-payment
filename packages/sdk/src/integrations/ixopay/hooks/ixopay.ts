export const mapIxopayErrorsToObject = (
  ixopayErrors: Array<{ attribute: string; message: string }>,
): Record<string, string> => {
  return ixopayErrors.reduce(
    (acc, { attribute, message }) => ({ ...acc, [attribute]: message }),
    {},
  );
};

export const removeErrorKey = (
  errors: Record<string, string>,
  key: string,
): Record<string, string> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _, ...rest } = errors;
  return rest;
};
