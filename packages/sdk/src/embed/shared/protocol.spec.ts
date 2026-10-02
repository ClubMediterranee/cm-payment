import {
  CAPS_MESSAGE_SOURCE,
  CAPS_PROTOCOL_VERSION,
  CapsMessageType,
  createCapsMessage,
  isCapsMessage,
  isCompatibleProtocolVersion,
} from './protocol';

describe('protocol', () => {
  describe('createCapsMessage', () => {
    it('should stamp source and version', () => {
      expect(createCapsMessage(CapsMessageType.RESIZE, { height: 420 })).toEqual({
        type: 'CAPS_RESIZE',
        height: 420,
        source: CAPS_MESSAGE_SOURCE,
        version: CAPS_PROTOCOL_VERSION,
      });
    });

    it('should accept messages without payload', () => {
      expect(createCapsMessage(CapsMessageType.READY)).toEqual({
        type: 'CAPS_READY',
        source: 'caps',
        version: CAPS_PROTOCOL_VERSION,
      });
    });
  });

  describe('isCapsMessage', () => {
    it('should accept CAPS messages', () => {
      expect(
        isCapsMessage(createCapsMessage(CapsMessageType.PAYMENT_REDIRECT, { url: 'https://psp' })),
      ).toBe(true);
    });

    it.each([
      ['null', null],
      ['a string', 'CAPS_READY'],
      ['a message without source', { type: 'CAPS_READY', version: 1 }],
      ['a message from another source', { type: 'CAPS_READY', source: 'other', version: 1 }],
      ['a message without version', { type: 'CAPS_READY', source: 'caps' }],
      ['an unknown type', { type: 'CAPS_UNKNOWN', source: 'caps', version: 1 }],
    ])('should reject %s', (_, data) => {
      expect(isCapsMessage(data)).toBe(false);
    });
  });

  describe('isCompatibleProtocolVersion', () => {
    it('should compare the major version only', () => {
      expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION)).toBe(true);
      expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION + 0.5)).toBe(true);
      expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION + 1)).toBe(false);
      expect(isCompatibleProtocolVersion('1')).toBe(false);
      expect(isCompatibleProtocolVersion(undefined)).toBe(false);
    });
  });

  it('should keep the legacy iframe message values', () => {
    expect(CapsMessageType.PAYMENT_REDIRECT).toBe('CAPS_PAYMENT_REDIRECT');
    expect(CapsMessageType.PAYMENT_REDIRECT_LOADING).toBe('CAPS_PAYMENT_REDIRECT_LOADING');
    expect(CapsMessageType.PAYMENT_REDIRECT_CANCEL).toBe('CAPS_PAYMENT_REDIRECT_CANCEL');
  });
});
