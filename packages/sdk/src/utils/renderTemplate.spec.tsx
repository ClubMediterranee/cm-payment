import { render } from '@testing-library/react';

import { renderTemplate } from './renderTemplate';

describe('renderTemplate', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('empty template', () => {
    it('returns null for empty string', () => {
      const result = renderTemplate('', {});
      expect(result).toBeNull();
    });
  });

  describe('single placeholder', () => {
    it('renders template with one placeholder', () => {
      const result = renderTemplate('Hello {name}', { name: 'John' });
      const { container } = render(result!);
      expect(container.textContent).toBe('Hello John');
    });

    it('renders placeholder at start', () => {
      const result = renderTemplate('{greeting} World', { greeting: 'Hello' });
      const { container } = render(result!);
      expect(container.textContent).toBe('Hello World');
    });

    it('renders placeholder at end', () => {
      const result = renderTemplate('Hello {name}', { name: 'World' });
      const { container } = render(result!);
      expect(container.textContent).toBe('Hello World');
    });
  });

  describe('multiple placeholders', () => {
    it('renders template with multiple placeholders', () => {
      const result = renderTemplate('Hello {firstName} {lastName}', {
        firstName: 'John',
        lastName: 'Doe',
      });
      const { container } = render(result!);
      expect(container.textContent).toBe('Hello John Doe');
    });

    it('renders same placeholder multiple times', () => {
      const result = renderTemplate('{name} says hello to {name}', { name: 'John' });
      const { container } = render(result!);
      expect(container.textContent).toBe('John says hello to John');
    });
  });

  describe('React components as values', () => {
    it('renders React element as placeholder value', () => {
      const result = renderTemplate('Click {button}', {
        button: <button>here</button>,
      });
      const { container } = render(result!);
      expect(container.querySelector('button')).not.toBeNull();
      expect(container.querySelector('button')?.textContent).toBe('here');
    });

    it('renders multiple React elements', () => {
      const result = renderTemplate('{icon} {text}', {
        icon: <span>🔥</span>,
        text: <strong>Bold</strong>,
      });
      const { container } = render(result!);
      expect(container.querySelector('span')).not.toBeNull();
      expect(container.querySelector('strong')).not.toBeNull();
    });
  });

  describe('plain text', () => {
    it('renders template without placeholders', () => {
      const result = renderTemplate('Hello World', {});
      const { container } = render(result!);
      expect(container.textContent).toBe('Hello World');
    });
  });

  describe('console output', () => {
    it('warns when value key is not used in template', () => {
      renderTemplate('Hello {name}', { name: 'John', unused: 'value' } as any);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Missing "unused" template');
    });

    it('warns for multiple unused keys', () => {
      renderTemplate('Hello', { key1: 'a', key2: 'b' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Missing "key1" template');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Missing "key2" template');
    });

    it('does not warn when all keys are used', () => {
      renderTemplate('Hello {name}', { name: 'John' });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles numeric values', () => {
      const result = renderTemplate('Count: {count}', { count: 42 });
      const { container } = render(result!);
      expect(container.textContent).toBe('Count: 42');
    });

    it('handles boolean values', () => {
      const result = renderTemplate('Active: {status}', { status: true });
      const { container } = render(result!);
      expect(container.textContent).toBe('Active: ');
    });

    it('handles zero value', () => {
      const result = renderTemplate('Value: {num}', { num: 0 });
      const { container } = render(result!);
      expect(container.textContent).toBe('Value: 0');
    });
  });
});
