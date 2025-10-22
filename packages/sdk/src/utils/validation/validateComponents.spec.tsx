import { OidcIssuerTypes } from '../../types/SDKOptions';
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
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should extract component keys from nested children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <div>
          <div>
            <MockPaymentSchedule />
            <MockCgv />
          </div>
          <div>
            <MockPaymentProviders />
            <MockIframeProvider />
          </div>
        </div>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle deeply nested children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

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
              <MockIframeProvider />
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
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);
      const RegularComponent = () => <div>Regular</div>;

      const children = (
        <>
          <MockPaymentSchedule />
          <RegularComponent />
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle text nodes', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <div>
          Some text
          <MockPaymentSchedule />
          More text
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
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
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should throw when PaymentSchedule is missing', () => {
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when Cgv is missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).toThrow(
        /Missing required components/,
      );
    });

    it('should throw when PaymentProviders is missing', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockIframeProvider />
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
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
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
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <MockPaymentSchedule />
          <MockPaymentSchedule />
          <MockCgv />
          <MockPaymentProviders />
          <MockIframeProvider />
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle array of children', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = [
        <MockPaymentSchedule key="1" />,
        <MockCgv key="2" />,
        <MockPaymentProviders key="3" />,
        <MockIframeProvider key="4" />,
      ];

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });

    it('should handle fragments', () => {
      const MockPaymentSchedule = createMockComponent(TOKENS.PaymentSchedule);
      const MockCgv = createMockComponent(TOKENS.Cgv);
      const MockPaymentProviders = createMockComponent(TOKENS.PaymentProviders);
      const MockIframeProvider = createMockComponent(TOKENS.IframeProvider);

      const children = (
        <>
          <>
            <MockPaymentSchedule />
            <MockCgv />
          </>
          <>
            <MockPaymentProviders />
            <MockIframeProvider />
          </>
        </>
      );

      expect(() => validateComponents(OidcIssuerTypes.GM, children)).not.toThrow();
    });
  });
});
