import type { Validate } from '../capsFormSchema';

export const validateComment: Validate = (data, { content, getProviderConfiguration }) => {
  const needComments = getProviderConfiguration(data.provider_id)?.settings?.requires_comments;

  if (needComments && !data.comments?.trim()) {
    return {
      path: ['comments'],
      message: content.comments.validation.required,
    };
  }

  return undefined;
};
