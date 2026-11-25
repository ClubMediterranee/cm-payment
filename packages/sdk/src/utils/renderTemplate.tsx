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

const LINK_PATTERN = /<a\s+([^>]*)>(.*?)<\/a>/gis;
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

const renderLinks = (text: string) => {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [link, attributes, label] = match;
    const href = attributes.match(/href\s*=\s*["']([^"']*)["']/i)?.[1];

    nodes.push(text.slice(cursor, match.index));
    nodes.push(
      href && SAFE_HREF.test(href) ? (
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {label}
        </a>
      ) : (
        label
      ),
    );
    cursor = match.index + link.length;
  }

  nodes.push(text.slice(cursor));

  return nodes;
};

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
        <React.Fragment key={i}>{renderLinks(part)}</React.Fragment>
      ),
    );

  return options?.asFragment ? content : <span className="text-left">{content}</span>;
};
