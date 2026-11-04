import type { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TITLE_VARIANTS = {
  default: 'text-h5 mb-16 font-serif',
  section: 'text-h4 mb-20 text-center font-serif',
  label: 'text-b2 mb-12 font-bold',
};

type TitleProps = PropsWithChildren<{
  variant?: keyof typeof TITLE_VARIANTS;
  className?: string;
}>;

export const Title = ({ variant = 'default', className, children }: TitleProps) =>
  children ? <h2 className={twMerge(TITLE_VARIANTS[variant], className)}>{children}</h2> : null;
