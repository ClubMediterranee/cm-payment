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
  on: (
    event: 'change' | 'load' | 'blur' | 'focus',
    callback: (data: CybersourceChangeData) => void,
  ) => void;
};

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
    styles: Record<string, unknown>;
  }) => CybersourceMicroform;
};

export type Cybersource = (token: string) => CybersourceFlex;
