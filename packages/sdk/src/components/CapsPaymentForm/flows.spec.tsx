import { OidcIssuerTypes } from '../../types/CapsSettings';
import { validateComponents } from '../../utils/validation/validateComponents';
import { CurrentFlow } from './CurrentFlow';
import { LegacyFlow } from './LegacyFlow';

describe.each([
  ['current', CurrentFlow],
  ['legacy', LegacyFlow],
])('%s flow', (_theme, Flow) => {
  it.each(Object.values(OidcIssuerTypes))(
    'exposes the required components of %s to the form validation when called as a function',
    (issuer) => {
      expect(() => validateComponents(issuer, Flow({}))).not.toThrow();
    },
  );
});
