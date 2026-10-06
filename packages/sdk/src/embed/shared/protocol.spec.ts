import { CAPS_PROTOCOL_VERSION, isCompatibleProtocolVersion } from './protocol';

describe('isCompatibleProtocolVersion', () => {
  it('should compare the major version only', () => {
    expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION)).toBe(true);
    expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION + 0.5)).toBe(true);
    expect(isCompatibleProtocolVersion(CAPS_PROTOCOL_VERSION + 1)).toBe(false);
    expect(isCompatibleProtocolVersion('1')).toBe(false);
    expect(isCompatibleProtocolVersion(undefined)).toBe(false);
  });
});
