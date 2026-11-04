import type { Validate } from '../capsFormSchema';

export const validateComment: Validate = (data, { content, getProviderConfiguration }) => {
  const requiresComments = getProviderConfiguration(data.provider_id)?.settings?.requires_comments;

  if (requiresComments && !data.comments?.trim()) {
    return {
      path: ['comments'],
      message: content.comments.validation.required,
    };
  }

  return undefined;
};
