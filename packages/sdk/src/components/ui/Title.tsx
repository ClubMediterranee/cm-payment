import type { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TITLE_VARIANTS = {
  default: 'text-h5 mb-16 font-serif font-bold',
  section: 'text-h4 mb-20 text-center font-serif font-bold',
  label: 'text-b2 mb-12 font-semibold',
};

type TitleProps = PropsWithChildren<{
  variant?: keyof typeof TITLE_VARIANTS;
  as?: 'h2' | 'h3' | 'h4';
  className?: string;
}>;

export const Title = ({
  variant = 'default',
  as: Heading = 'h2',
  className,
  children,
}: TitleProps) =>
  children ? (
    <Heading className={twMerge(TITLE_VARIANTS[variant], className)}>{children}</Heading>
  ) : null;
