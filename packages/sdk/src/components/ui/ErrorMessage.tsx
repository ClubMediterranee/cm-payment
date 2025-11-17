import { Icon } from '@clubmed/trident-icons';
import clsx from 'clsx';

export const ErrorMessage = ({ message }: { message?: string }) => {
  return (
    <span
      className={clsx('text-red font-bold flex gap-10 items-center my-10', !message && 'hidden')}
      aria-hidden={!message}
      role="alert"
    >
      <Icon name="Error" width="1rem" />
      {message}
    </span>
  );
};
