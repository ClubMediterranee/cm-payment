export type CybersourceTokenResponse = {
  ctx: [
    {
      data: {
        clientLibrary: string;
        clientLibraryIntegrity: string;
        allowedCardNetworks?: string[];
      };
    },
  ];
};

export type CybersourceConfig = {
  scriptUrl: string;
  scriptIntegrity: string;
  allowedCardNetworks?: string[];
};

export type CybersourceChangeData = {
  valid: boolean;
  empty: boolean;
  card?: Array<{ name: string }>;
};

export type CybersourceField = {
  load: (selector: string) => void;
  on(event: 'change', callback: (data: CybersourceChangeData) => void): void;
  on(event: 'load' | 'focus' | 'blur', callback: () => void): void;
};

export type CybersourceStyle = Partial<
  Record<'font-family' | 'font-size' | 'line-height' | 'color', string>
>;

export type CybersourceStyles = Partial<
  Record<'input' | '::placeholder' | ':focus' | ':disabled' | 'valid' | 'invalid', CybersourceStyle>
>;

export type CybersourceMicroform = {
  createField: (
    type: 'number' | 'securityCode',
    options: { placeholder: string },
  ) => CybersourceField;
  createToken: (
    data: { expirationMonth: string; expirationYear: string },
    callback: (err: Error | null, token: string) => void,
  ) => void;
};

export type CybersourceFlex = {
  microform: (options: {
    keyId: string;
    keystore: string;
    container: string;
    label: string;
    placeholder: string;
    styles: CybersourceStyles;
  }) => CybersourceMicroform;
};

export type Cybersource = (token: string) => CybersourceFlex;

declare global {
  interface Window {
    Flex: new (token: string) => CybersourceFlex;
  }
}
