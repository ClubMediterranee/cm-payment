import React from 'react';

type ExtractPlaceholders<S extends string> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractPlaceholders<Rest>
  : never;

type TemplateValues<T extends string> = Record<ExtractPlaceholders<T>, React.ReactNode>;

export const renderTemplate = <T extends string>(
  template: T,
  values: TemplateValues<T>,
  options?: { asFragment?: boolean },
) => {
  if (!template) {
    return null;
  }
  const found = Array.from(template.matchAll(/{(\w+)}/g), (m) => m[1]);

  (Object.keys(values) as string[]).forEach((key) => {
    if (!found.includes(key)) {
      console.warn(`Missing "${key}" template`);
    }
  });

  const content = template
    .split(/({\w+})/g)
    .map((part, i) =>
      /^{(\w+)}$/.test(part) ? (
        <React.Fragment key={i}>
          {values[part.slice(1, -1) as ExtractPlaceholders<T>]}
        </React.Fragment>
      ) : (
        part
      ),
    );

  return options?.asFragment ? content : <span className="text-left">{content}</span>;
};
