import { render } from '@testing-library/react';

import { formatTemplate, renderTemplate } from './renderTemplate';

describe('renderTemplate', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
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

  describe('links', () => {
    it('renders markdown links as anchors opening in a new tab', () => {
      const result = renderTemplate(
        'I accept the [Terms](https://clubmed.com/cgv) and the [Form](https://clubmed.com/form).',
        {},
      );
      const { container } = render(result!);
      const links = container.querySelectorAll('a');
      expect(container.textContent).toBe('I accept the Terms and the Form.');
      expect(Array.from(links, (a) => [a.textContent, a.getAttribute('href')])).toEqual([
        ['Terms', 'https://clubmed.com/cgv'],
        ['Form', 'https://clubmed.com/form'],
      ]);
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('interpolates placeholders in the link label and url', () => {
      const result = renderTemplate('See the [{label}]({url})', {
        label: 'Information Form',
        url: 'https://clubmed.com/form',
      });
      const { container } = render(result!);
      const link = container.querySelector('a');
      expect(link?.textContent).toBe('Information Form');
      expect(link?.getAttribute('href')).toBe('https://clubmed.com/form');
    });

    it('renders the label as text when the url is empty', () => {
      const result = renderTemplate('I accept the [terms]()', {});
      const { container } = render(result!);
      expect(container.querySelector('a')).toBeNull();
      expect(container.textContent).toBe('I accept the terms');
    });

    it('renders the label as text when the url is unsafe', () => {
      const result = renderTemplate('I accept the [terms](javascript:alert(1))', {});
      const { container } = render(result!);
      expect(container.querySelector('a')).toBeNull();
    });

    it('keeps brackets that are not followed by a url as text', () => {
      const result = renderTemplate('Payment obligation. [FBL] I accept', {});
      const { container } = render(result!);
      expect(container.querySelector('a')).toBeNull();
      expect(container.textContent).toBe('Payment obligation. [FBL] I accept');
    });

    it('requires the placeholders used in a link', () => {
      // @ts-expect-error missing url value
      expect(renderTemplate('See the [form]({url})', {})).not.toBeNull();
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

describe('formatTemplate', () => {
  it('replaces the placeholders with their values', () => {
    expect(
      formatTemplate('For {adults} adults and {children} children', { adults: 2, children: 1 }),
    ).toBe('For 2 adults and 1 children');
  });
});
