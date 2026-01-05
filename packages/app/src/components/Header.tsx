import { useCapsConfigContext } from '@clubmed/caps';
import { Icon } from '@clubmed/trident-icons';

import { ImmersiveBreadcrumb } from './ImmersiveBreadcrumb';

export const Header = () => {
  const { id } = useCapsConfigContext();
  return (
    <div className="w-full">
      <header
        className="bg-white p-4 flex items-center border-b border-grey px-40"
        style={{ height: 60 }}
      >
        <div className="flex justify-between items-center font-semibold flex-row w-full">
          <Icon name="ClubMed" width="10rem" />
        </div>
      </header>
      {id && <ImmersiveBreadcrumb />}
    </div>
  );
};
