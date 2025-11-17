import { mergeFromPattern } from './mergeFromPattern';

const content = {
  cgv: {
    title: 'CGV',
    content: 'CGV content',
    validation: {
      required: 'CGV required',
    },
  },
};

describe('mergeFromPattern', () => {
  describe('type safety', () => {
    it('rejects type mismatch at root level', () => {
      const userContent = { cgv: 3 } as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv).toEqual(content.cgv);
      expect(typeof result.cgv).toBe('object');
    });

    it('rejects type mismatch in nested properties', () => {
      const userContent = {
        cgv: {
          title: 123,
        },
      } as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv.title).toBe(content.cgv.title);
      expect(typeof result.cgv.title).toBe('string');
    });

    it('rejects object replaced by primitive', () => {
      const userContent = {
        cgv: 'invalid',
      } as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv).toEqual(content.cgv);
      expect(typeof result.cgv).toBe('object');
    });
  });

  describe('partial merging', () => {
    it('merges partial top-level properties', () => {
      const userContent = {
        cgv: {
          title: 'Custom Title',
          content: 'Custom content',
        },
      } as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv.title).toBe(userContent.cgv.title);
      expect(result.cgv.content).toBe(userContent.cgv.content);
      expect(result.cgv.validation).toEqual(content.cgv.validation);
    });

    it('merges nested partial properties', () => {
      const userContent = {
        cgv: {
          validation: {
            required: 'Custom error',
          },
        },
      } as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv.validation.required).toBe('Custom error');
      expect(result.cgv.title).toBe(content.cgv.title);
      expect(result.cgv.content).toBe(content.cgv.content);
    });

    it('keeps all default values when wrong values are provided', () => {
      const userContent = {} as any;
      const result = mergeFromPattern(content, userContent);

      expect(result.cgv.title).toBe(content.cgv.title);
      expect(result.cgv.validation.required).toBe(content.cgv.validation.required);
    });
  });
});
