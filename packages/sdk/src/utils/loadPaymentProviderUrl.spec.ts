import type { RefObject } from 'react';

import type { ProviderParametersModel } from '../__generated__/index.schemas';
import { loadPaymentProviderUrl } from './loadPaymentProviderUrl';

describe('loadPaymentProviderUrl', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    document.body.innerHTML = '';
  });

  describe('GET method', () => {
    it('should redirect to url for GET method', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
      };

      loadPaymentProviderUrl(params);

      expect(window.location.href).toBe('https://example.com/payment');
    });

    it('should handle GET method case-insensitively', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'get',
      };

      loadPaymentProviderUrl(params);

      expect(window.location.href).toBe('https://example.com/payment');
    });

    it('should append body as query params with ? for GET method', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
        body: 'amount=100&currency=EUR&merchant_id=123',
      };

      loadPaymentProviderUrl(params);

      expect(window.location.href).toBe(
        'https://example.com/payment?amount=100&currency=EUR&merchant_id=123',
      );
    });

    it('should handle GET with body in iframe', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      const iframeRef: RefObject<HTMLIFrameElement> = { current: iframe };

      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
        body: 'token=abc123&session=xyz',
      };

      loadPaymentProviderUrl(params, iframeRef);

      expect(iframe.src).toBe('https://example.com/payment?token=abc123&session=xyz');
      expect(window.location.href).not.toBe('https://example.com/payment?token=abc123&session=xyz');

      document.body.removeChild(iframe);
    });
  });

  describe('POST method', () => {
    it('should create and submit a form for POST method', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'POST',
        body: 'amount=100&currency=USD&merchant_id=12345',
      };

      const submitSpy = vi.fn();
      HTMLFormElement.prototype.submit = submitSpy;

      loadPaymentProviderUrl(params);

      expect(submitSpy).toHaveBeenCalledTimes(1);

      const form = document.querySelector('form');
      expect(form).not.toBeNull();
      expect(form?.method.toUpperCase()).toBe('POST');
      expect(form?.action).toBe('https://example.com/payment');
      expect(form?.style.display).toBe('none');

      const inputs = form?.querySelectorAll('input[type="hidden"]');
      expect(inputs?.length).toBe(3);

      const inputArray = Array.from(inputs || []);
      expect(inputArray[0].getAttribute('name')).toBe('amount');
      expect(inputArray[0].getAttribute('value')).toBe('100');
      expect(inputArray[1].getAttribute('name')).toBe('currency');
      expect(inputArray[1].getAttribute('value')).toBe('USD');
      expect(inputArray[2].getAttribute('name')).toBe('merchant_id');
      expect(inputArray[2].getAttribute('value')).toBe('12345');
    });

    it('should handle POST method case-insensitively', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'post',
        body: 'test=value',
      };

      const submitSpy = vi.fn();
      HTMLFormElement.prototype.submit = submitSpy;

      loadPaymentProviderUrl(params);

      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if POST method has no body', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'POST',
      };

      expect(() => loadPaymentProviderUrl(params)).toThrow('POST redirect requires a body');
    });

    it('should handle URL-encoded special characters in body', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'POST',
        body: 'name=John%20Doe&email=test%40example.com&redirect_url=https%3A%2F%2Fexample.com%2Fcallback',
      };

      const submitSpy = vi.fn();
      HTMLFormElement.prototype.submit = submitSpy;

      loadPaymentProviderUrl(params);

      const form = document.querySelector('form');
      const inputs = Array.from(form?.querySelectorAll('input[type="hidden"]') || []);

      expect(inputs[0].getAttribute('value')).toBe('John Doe');
      expect(inputs[1].getAttribute('value')).toBe('test@example.com');
      expect(inputs[2].getAttribute('value')).toBe('https://example.com/callback');
    });
  });

  describe('unsupported methods', () => {
    it('should throw error for unsupported HTTP method', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'PUT',
      };

      expect(() => loadPaymentProviderUrl(params)).toThrow('Unsupported HTTP method: PUT');
    });
  });

  describe('iframe target', () => {
    it('should set iframe src for GET method with iframe target', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      const iframeRef: RefObject<HTMLIFrameElement> = { current: iframe };

      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
      };

      loadPaymentProviderUrl(params, iframeRef);

      expect(iframe.src).toBe('https://example.com/payment');
      expect(window.location.href).not.toBe('https://example.com/payment');

      document.body.removeChild(iframe);
    });

    it('should submit form targeting iframe for POST method', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      const iframeRef: RefObject<HTMLIFrameElement> = { current: iframe };

      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'POST',
        body: 'amount=100&currency=USD',
      };

      const submitSpy = vi.fn();
      HTMLFormElement.prototype.submit = submitSpy;

      loadPaymentProviderUrl(params, iframeRef);

      expect(submitSpy).toHaveBeenCalledTimes(1);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const form = iframeDoc?.querySelector('form');
      expect(form).not.toBeNull();
      expect(form?.method.toUpperCase()).toBe('POST');
      expect(form?.action).toBe('https://example.com/payment');

      document.body.removeChild(iframe);
    });

    it('should handle undefined iframe reference gracefully', () => {
      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
      };

      loadPaymentProviderUrl(params, undefined);

      expect(window.location.href).toBe('https://example.com/payment');
    });

    it('should handle ref with null current gracefully', () => {
      const iframeRef: RefObject<HTMLIFrameElement | null> = { current: null };

      const params: ProviderParametersModel = {
        url: 'https://example.com/payment',
        method: 'GET',
      };

      loadPaymentProviderUrl(params, iframeRef);

      expect(window.location.href).toBe('https://example.com/payment');
    });
  });
});
