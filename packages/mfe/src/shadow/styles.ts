import rawCss from '../styles/index.css?inline';

// `@import url("…")`, `@import url(…)` or `@import "…"`; URLs may contain `;` (Google Fonts `wght@400;600`).
const IMPORT_RULE =
  /@import\s+(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)|"([^"]*)"|'([^']*)')[^;]*;/g;
const FONT_FACE_RULE = /@font-face\s*{[^}]*}/g;

export type SplitStyles = {
  /**
   * Rules applied inside the shadow root.
   */
  shadowCss: string;
  /**
   * Stylesheets imported with `@import url(…)` (web fonts). Not allowed in constructable stylesheets.
   */
  documentImports: string[];
  /**
   * `@font-face` rules are only reliably applied when declared in the document.
   */
  fontFaces: string[];
};

export function splitStyles(css: string): SplitStyles {
  const documentImports = [...css.matchAll(IMPORT_RULE)].map(([, ...hrefs]) =>
    hrefs.find((href) => href !== undefined),
  ) as string[];
  const fontFaces = css.match(FONT_FACE_RULE) || [];
  const shadowCss = css.replace(IMPORT_RULE, '').replace(FONT_FACE_RULE, '');

  return { shadowCss, documentImports, fontFaces };
}

const DOCUMENT_MARKER = 'data-caps-styles';

/**
 * Inject web fonts in the document `<head>`, once per page.
 */
export function injectDocumentStyles(
  { documentImports, fontFaces }: Pick<SplitStyles, 'documentImports' | 'fontFaces'>,
  targetDocument: Document = document,
) {
  if (targetDocument.head.querySelector(`[${DOCUMENT_MARKER}]`)) {
    return;
  }

  documentImports.forEach((href) => {
    const link = targetDocument.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(DOCUMENT_MARKER, 'import');
    targetDocument.head.appendChild(link);
  });

  const style = targetDocument.createElement('style');
  style.setAttribute(DOCUMENT_MARKER, 'fonts');
  style.textContent = fontFaces.join('\n');
  targetDocument.head.appendChild(style);
}

const supportsConstructableStylesheets = () => {
  try {
    return typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype;
  } catch {
    return false;
  }
};

let sharedSheet: CSSStyleSheet | undefined;

const STYLE_MARKER = 'data-caps-shadow-styles';

/**
 * Apply the CAPS stylesheet to a shadow root (constructable stylesheet, `<style>` fallback). Idempotent.
 */
export function applyShadowStyles(root: ShadowRoot, shadowCss: string) {
  if (supportsConstructableStylesheets() && 'adoptedStyleSheets' in root) {
    if (!sharedSheet) {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(shadowCss);
    }

    if (!root.adoptedStyleSheets.includes(sharedSheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sharedSheet];
    }

    return;
  }

  if (!root.querySelector(`style[${STYLE_MARKER}]`)) {
    const style = document.createElement('style');
    style.setAttribute(STYLE_MARKER, '');
    style.textContent = shadowCss;
    root.prepend(style);
  }
}

let capsStyles: SplitStyles | undefined;

export const getCapsStyles = () => (capsStyles ??= splitStyles(rawCss));
