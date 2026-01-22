import { OidcIssuerTypes } from '../../types/CapsSettings';
import { TOKENS } from '../../types/Tokens';
import { validateComponents } from './validateComponents';

const createMockComponent = (componentKey: symbol) => {
  const Component = () => <div>Mock Component</div>;
  (Component as any).COMPONENT_KEY = componentKey;
  return Component;
};

describe('validateComponents', () => {
  describe('getAvailableComponent', () => {
    it('should extract component keys from simple children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should extract component keys from nested children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <div>
          <div>
            <MockPaymentSchedule />
            <MockCgv />
          </div>
          <div>
            <MockPaymentProviders />
            <MockPaymentWidget />
            <MockSubmitButton />
          </div>
        </div>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle deeply nested children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <div>
          <div>
            <div>
              <MockPaymentSchedule />
            </div>
          </div>
          <MockCgv />
          <div>
            <MockPaymentProviders />
            <div>
              <MockPaymentWidget />
              <MockSubmitButton />
            </div>
          </div>
        </div>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should ignore components without COMPONENT_KEY', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);
      const RegularComponent = () => <div>Regular</div>;

      const children = (
        <>
          <MockPaymentSchedule />
          <RegularComponent />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle text nodes', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <div>
          Some text
          <MockPaymentSchedule />
          More text
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton />
        </div>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle empty children', () => {
      expect(() => validateComponents(OidcIssuerTypes.PARTNERS, null)).not.toThrow();
    });

    it('should handle undefined children', () => {
      expect(() => validateComponents(OidcIssuerTypes.PARTNERS, undefined)).not.toThrow();
    });
  });

  describe('validateComponents for GM issuer', () => {
    it('should not throw when all required components are present', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should throw when PaymentSchedule is missing', () => {
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);

      const children = (
        <>
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when Cgv is missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockPaymentProviders />
          <MockPaymentWidget />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when PaymentProviders is missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentWidget />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when IframeProvider is missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when multiple components are missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when all components are missing', () => {
      const children = <div>No valid components</div>;

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });
  });

  describe('validateComponents for GO issuer', () => {
    it('should not throw when all required components are present', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GO, children)).not.toThrow();
    });

    it('should throw when components are missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);

      const children = <MockPaymentSchedule />;

      expect(() => validateComponents(OidcIssuerTypes.GO, children)).toThrow(
        /Missing required components/,
      );
    });
  });

  describe('validateComponents for PARTNERS issuer', () => {
    it('should not throw when no components are required', () => {
      const children = <div>Any content</div>;

      expect(() => validateComponents(OidcIssuerTypes.PARTNERS, children)).not.toThrow();
    });

    it('should not throw with empty children', () => {
      expect(() => validateComponents(OidcIssuerTypes.PARTNERS, null)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate components', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockPaymentWidget />
          <MockSubmitButton />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle array of children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = [
        <MockPaymentSchedule key="1" />,
        <MockCgv key="2" />,
        <MockPaymentProviders key="3" />,
        <MockPaymentWidget key="4" />,
        <MockSubmitButton key="5" />,
      ];

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle fragments', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockPaymentWidget = createMockComponent(TOKENS.PaymentWidget);
      const MockSubmitButton = createMockComponent(TOKENS.SubmitButton);

      const children = (
        <>
          <>
            <MockPaymentSchedule />
            <MockCgv />
          </>
          <>
            <MockPaymentProviders />
            <MockPaymentWidget />
            <MockSubmitButton />
          </>
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });
  });
});
