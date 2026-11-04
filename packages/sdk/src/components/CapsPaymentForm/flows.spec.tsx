import { OidcIssuerTypes } from '../../types/CapsSettings';
import { validateComponents } from '../../utils/validation/validateComponents';
import { defaultContent } from '../../content/default';
import { CurrentFlow } from './CurrentFlow';
import { LegacyFlow } from './LegacyFlow';

describe.each([
  ['current', CurrentFlow],
  ['legacy', LegacyFlow],
] as const)('%s flow', (theme, Flow) => {
  it.each(Object.values(OidcIssuerTypes))(
    'exposes the required components of %s to the form validation when called as a function',
    (issuer) => {
      expect(() =>
        validateComponents(issuer, Flow({ content: defaultContent }), theme),
      ).not.toThrow();
    },
  );
});
