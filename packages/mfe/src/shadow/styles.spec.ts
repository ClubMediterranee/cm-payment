import { applyShadowStyles, injectDocumentStyles, splitStyles } from './styles';

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Newsreader:opsz,wght@6..72,700&display=swap';

describe('splitStyles', () => {
  it.each([
    [`@import url('${GOOGLE_FONTS}');`],
    [`@import url("${GOOGLE_FONTS}");`],
    [`@import url(${GOOGLE_FONTS});`],
    [`@import "${GOOGLE_FONTS}";`],
    [`@import '${GOOGLE_FONTS}' screen;`],
  ])('extracts %s without breaking the stylesheet', (importRule) => {
    const css = `${importRule}\n:host{--color-sienna:13deg 48% 39%}\n.text-h5{font-size:20px}`;

    expect(splitStyles(css)).toEqual({
      documentImports: [GOOGLE_FONTS],
      fontFaces: [],
      shadowCss: '\n:host{--color-sienna:13deg 48% 39%}\n.text-h5{font-size:20px}',
    });
  });

  it('moves @font-face rules to the document', () => {
    const fontFace = '@font-face{font-family:Inter;src:url(inter.woff2)}';

    expect(splitStyles(`${fontFace}.a{color:red}`)).toEqual({
      documentImports: [],
      fontFaces: [fontFace],
      shadowCss: '.a{color:red}',
    });
  });
});

describe('injectDocumentStyles', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('injects the web fonts once', () => {
    const styles = { documentImports: [GOOGLE_FONTS], fontFaces: ['@font-face{font-family:A}'] };

    injectDocumentStyles(styles);
    injectDocumentStyles(styles);

    expect(document.head.querySelectorAll('link[data-caps-styles]')).toHaveLength(1);
    expect(document.head.querySelector('link')?.getAttribute('href')).toBe(GOOGLE_FONTS);
    expect(document.head.querySelector('style[data-caps-styles]')?.textContent).toBe(
      '@font-face{font-family:A}',
    );
  });
});

describe('applyShadowStyles', () => {
  it('falls back to a single <style> element without constructable stylesheets', () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });

    applyShadowStyles(root, '.a{color:red}');
    applyShadowStyles(root, '.a{color:red}');

    const styles = root.querySelectorAll('style');
    expect(styles.length + (root.adoptedStyleSheets?.length ?? 0)).toBe(1);
  });
});
