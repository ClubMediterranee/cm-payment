import { PropsWithChildren } from 'react';
import { Controller } from 'react-hook-form';

import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useFormContext } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { FormPanel } from './ui/FormPanel';
import { TextFieldSkeleton, TitleSkeleton } from './ui/skeletons';
import { Textarea } from './ui/Textarea';

export const Comments = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const { content } = useCapsConfigContext();
  const { control } = useFormContext();
  const watchedProvider = useWatchedPaymentProvider();
  const { data: paymentConfig } = usePaymentConfig();

  const isEnabled =
    paymentConfig?.feature_flips?.is_comments_enabled ||
    watchedProvider?.configuration?.settings?.requires_comments;

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={className}>
      {children}
      <FormPanel>
        <Controller
          name="comments"
          control={control}
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <Textarea
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={content.comments.placeholder}
              errorMessage={error?.message}
              dataTestId="payment-comments"
            />
          )}
        />
      </FormPanel>
    </div>
  );
};

const CommentsSkeleton = () => (
  <div className="w-full flex flex-col gap-16">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <TextFieldSkeleton />
    </FormPanel>
  </div>
);

Comments.Skeleton = CommentsSkeleton;
Comments.COMPONENT_KEY = TOKENS.Comments;
