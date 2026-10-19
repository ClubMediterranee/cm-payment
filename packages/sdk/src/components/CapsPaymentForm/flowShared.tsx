import { twMerge } from 'tailwind-merge';

import type { CapsFormSlots } from '../../embed/shared';
import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import type { Content } from '../../types/Content';

type HeadingSection = {
  [K in keyof Content]: Content[K] extends { heading: string } ? K : never;
}[keyof Content];

export type FlowLayoutProps = {
  slots?: CapsFormSlots;
  reference?: string;
  uuid?: string;
};

const TITLE_VARIANTS = {
  default: 'text-h5 mb-16 font-serif',
  section: 'text-h4 mb-20 text-center font-serif',
  label: 'text-b3 mb-12 font-bold',
};

type TitleProps = {
  section: HeadingSection;
  variant?: keyof typeof TITLE_VARIANTS;
  className?: string;
};

export const Title = ({ section, variant = 'default', className }: TitleProps) => {
  const { content } = useCapsConfigContext();
  const { heading } = content[section];

  return heading ? (
    <h2 className={twMerge(TITLE_VARIANTS[variant], className)}>{heading}</h2>
  ) : null;
};

export const SubmitLabel = () => useCapsConfigContext().content.submit.label;
