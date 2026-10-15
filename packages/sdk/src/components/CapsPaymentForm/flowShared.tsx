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

export const Title = ({ section }: { section: HeadingSection }) => {
  const { content } = useCapsConfigContext();
  const { heading } = content[section];

  return heading ? <h2 className="text-h5 mb-16 font-serif">{heading}</h2> : null;
};

export const SubmitLabel = () => useCapsConfigContext().content.submit.label;
