import { createCybersourceMicroform } from './cybersource';

describe('createCybersourceMicroform', () => {
  let microformSpy: ReturnType<typeof vi.fn>;
  let FlexConstructor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const microformReturn = { token: 'microform-instance' };
    microformSpy = vi.fn().mockReturnValue(microformReturn);
    FlexConstructor = vi.fn(function (this: any) {
      this.microform = microformSpy;
    });
    (global as any).window = { Flex: FlexConstructor };
  });

  it('instantiates Flex with the token and forwards the field configuration to microform', () => {
    const result = createCybersourceMicroform('secret-token', {
      cardNumber: { selector: 'card-number', placeholder: 'Card number' },
      cvc: { selector: 'cvc', placeholder: 'CVC' },
    });

    expect(FlexConstructor).toHaveBeenCalledWith('secret-token');
    expect(microformSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        keyId: 'secret-token',
        keystore: 'secret-token',
        container: '#card-number',
        label: '.HostedField-label',
        placeholder: 'Card number',
      }),
    );
    expect(result).toEqual({ token: 'microform-instance' });
  });
});
