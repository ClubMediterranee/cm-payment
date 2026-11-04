/**
 * Scope the CAPS stylesheet to the `<caps-form>` shadow root:
 * - `:root`, `html` and `body` selectors target `:host` (CSS variables and base styles are declared on the
 *   shadow host, so host page variables such as shadcn / Tailwind v4 `--color-*` cannot leak in),
 * - `rem` values are converted to `px` so that sizing does not depend on the host `html { font-size }`.
 */
const ROOT_SELECTOR = /(^|[\s>+~,(])(?::root|html|body)(?![\w-])/g;
const REM_VALUE = /(-?\d*\.?\d+)rem\b/g;
const ROOT_FONT_SIZE = 16;

const toPx = (_, value) => `${Number((Number(value) * ROOT_FONT_SIZE).toFixed(4))}px`;

const isInsideKeyframes = (node) => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) {
      return true;
    }
  }
  return false;
};

export default function hostScope() {
  return {
    postcssPlugin: 'caps-host-scope',
    Rule(rule) {
      if (isInsideKeyframes(rule)) {
        return;
      }

      const selector = rule.selector.replace(ROOT_SELECTOR, '$1:host');

      if (selector !== rule.selector) {
        rule.selector = selector;
      }
    },
    Declaration(decl) {
      if (decl.value.includes('rem')) {
        decl.value = decl.value.replace(REM_VALUE, toPx);
      }
    },
  };
}

hostScope.postcss = true;
