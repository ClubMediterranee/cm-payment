import { PropsWithChildren } from 'react';

import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { CheckboxField } from './ui/Form/CheckboxField';
import { FormPanel } from './ui/FormPanel';
import { CheckboxSkeleton, TitleSkeleton } from './ui/skeletons';

export const Cgv = ({ children }: PropsWithChildren) => {
  const { content } = useCapsConfigContext();

  return (
    <FormPanel className="w-full rounded-32 bg-white">
      {children}
      <CheckboxField name="cgv">
        <span className="text-b4 md:text-b3">
          {renderTemplate(content.cgv.content, {}, { asFragment: true })}
        </span>
      </CheckboxField>
    </FormPanel>
  );
};

const CgvSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <CheckboxSkeleton />
    </FormPanel>
  </div>
);

Cgv.Skeleton = CgvSkeleton;
Cgv.COMPONENT_KEY = TOKENS.Cgv;
