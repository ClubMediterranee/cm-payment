import { getPaymentConfig } from '../providers/PaymentConfigProvider';
import { defaultNavigate, navigate, submitPostForm } from './navigate';

vi.mock('../providers/PaymentConfigProvider', () => ({
  getPaymentConfig: vi.fn(() => ({})),
}));

describe('navigate', () => {
  let originalLocation: Location;
  const submit = vi.fn();

  beforeEach(() => {
    originalLocation = window.location;
    // @ts-expect-error jsdom location is not writable
    delete window.location;
    window.location = { href: '' } as unknown as Location & string;
    HTMLFormElement.prototype.submit = submit;
  });

  afterEach(() => {
    window.location = originalLocation as Location & string;
    document.body.innerHTML = '';
    vi.mocked(getPaymentConfig).mockReturnValue({} as never);
    submit.mockReset();
  });

  it('navigates the window by default', () => {
    navigate({ url: 'https://psp.example/pay' });

    expect(window.location.href).toBe('https://psp.example/pay');
  });

  it('submits a hidden form for POST navigations by default', () => {
    defaultNavigate({ url: 'https://psp.example/pay', method: 'POST', fields: { a: '1' } });

    const form = document.querySelector('form')!;
    expect(form.method.toUpperCase()).toBe('POST');
    expect(form.action).toBe('https://psp.example/pay');
    expect(form.querySelector('input')?.name).toBe('a');
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('defaults POST fields to an empty set', () => {
    defaultNavigate({ url: 'https://psp.example/pay', method: 'POST' });

    expect(document.querySelectorAll('form input')).toHaveLength(0);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('delegates to onNavigate when provided', () => {
    const onNavigate = vi.fn();
    vi.mocked(getPaymentConfig).mockReturnValue({ onNavigate } as never);

    navigate({ url: 'https://host.example/cb', method: 'GET' });

    expect(onNavigate).toHaveBeenCalledWith({ url: 'https://host.example/cb', method: 'GET' });
    expect(window.location.href).toBe('');
  });

  it('submits a form in the given document', () => {
    const targetDocument = document.implementation.createHTMLDocument('target');

    submitPostForm('https://psp.example/pay', { b: '2' }, targetDocument);

    expect(targetDocument.querySelector('form input')?.getAttribute('value')).toBe('2');
    expect(document.querySelector('form')).toBeNull();
  });
});
