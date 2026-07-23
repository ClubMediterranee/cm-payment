import { defaultContent } from '../../content/default';
import type { CapsFormConfig } from '../../types/CapsFormConfig';
import type { CapsFormSchema } from '../capsFormSchema';
import { validateComment } from './validateComment';

const mockConfig: CapsFormConfig = {
  content: defaultContent,
  isSeller: true,
  maxAmount: 10000,
  getProviderConfiguration: () => ({ settings: { requires_comments: true } }),
};

describe('validateComment', () => {
  it('returns undefined when provider does not require comments', () => {
    const result = validateComment(
      { provider_id: 'PROVIDER', comments: '' } as unknown as CapsFormSchema,
      {
        ...mockConfig,
        getProviderConfiguration: () => ({ settings: {} }),
      },
    );

    expect(result).toBeUndefined();
  });

  it('returns an error when comments are required and the comment is empty', () => {
    const result = validateComment(
      { provider_id: 'PROVIDER', comments: '   ' } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toEqual({
      path: ['comments'],
      message: defaultContent.comments.validation.required,
    });
  });

  it('returns undefined when comments are required and the comment is filled', () => {
    const result = validateComment(
      { provider_id: 'PROVIDER', comments: 'a note' } as unknown as CapsFormSchema,
      mockConfig,
    );

    expect(result).toBeUndefined();
  });
});
