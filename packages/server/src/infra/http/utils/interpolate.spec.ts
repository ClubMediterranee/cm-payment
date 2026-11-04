import { interpolate } from './interpolate.js';

describe('interpolate', () => {
  it('should interpolate', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
    expect(
      interpolate('Hello {name} {lastname}', {
        name: 'World',
        lastname: 'foo',
      }),
    ).toBe('Hello World foo');
    expect(interpolate('Hello {name} {lastname}', { name: 'World' })).toBe('Hello World ');
  });
});
