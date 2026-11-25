import { Button, type ButtonProps } from '@clubmed/trident-ui/ui/buttons/Button';
import clsx from 'clsx';

type InfoButtonProps = Omit<ButtonProps, 'variant' | 'color' | 'size' | 'icon'> & {
  'aria-label': string;
};

export const InfoButton = ({ className, ...props }: InfoButtonProps) => (
  <Button
    variant="circle"
    color="white"
    size="small"
    icon="Information"
    className={clsx('size-24 shrink-0 p-0 inset-ring-0', className)}
    {...props}
  />
);
