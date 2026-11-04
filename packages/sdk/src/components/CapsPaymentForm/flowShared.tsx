import type { CapsFormSlots } from '../../embed/shared';
import type { Content } from '../../types/Content';

export type FlowLayoutProps = {
  content: Content;
  slots?: CapsFormSlots;
  reference?: string;
  uuid?: string;
};
