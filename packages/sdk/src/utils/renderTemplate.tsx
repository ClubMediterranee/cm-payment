import React from 'react';

type ExtractPlaceholders<S extends string> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractPlaceholders<Rest>
  : never;

type TemplateValues<T extends string> = Record<ExtractPlaceholders<T>, React.ReactNode>;

export const formatTemplate = <T extends string>(
  template: T,
  values: Record<ExtractPlaceholders<T>, string | number>,
) =>
  template.replace(/{(\w+)}/g, (placeholder, key: ExtractPlaceholders<T>) =>
    String(values[key] ?? placeholder),
  );

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

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

  const interpolate = (text: string) =>
    text
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

  const content = template.split(/(\[[^\]]+\]\([^)]*\))/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
    if (!link) {
      return <React.Fragment key={i}>{interpolate(part)}</React.Fragment>;
    }
    const [, label, url] = link;
    const href = formatTemplate(url, values);
    return href && SAFE_HREF.test(href) ? (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline">
        {interpolate(label)}
      </a>
    ) : (
      <React.Fragment key={i}>{interpolate(label)}</React.Fragment>
    );
  });

  return options?.asFragment ? content : <span className="text-left">{content}</span>;
};
