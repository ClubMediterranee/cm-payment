import { useCapsConfigContext } from '@clubmed/payment-sdk/hooks/utils/useCapsConfigContext';
import { Icon } from '@clubmed/trident-icons';
import { Breadcrumb } from '@clubmed/trident-ui/molecules/Breadcrumb';
import { useSearch } from 'wouter';

export const Header = () => {
  const { id, oidc } = useCapsConfigContext();
  const search = useSearch();
  const backUrl = new URLSearchParams(search).get('back_url');

  return (
    <div className="w-full">
      <header
        className="bg-white p-4 shadow-md flex items-center justify-center border-b border-saffron"
        style={{ height: 60 }}
      >
        <div
          className="flex justify-between items-center font-semibold flex-row"
          style={{ width: 1200 }}
        >
          <Icon name="ClubMed" width="120px" />
          <span className="flex justify-center items-center">
            {oidc?.issuerType?.toUpperCase()} {id}
          </span>
        </div>
      </header>
      <div className="p-8">
        <Breadcrumb
          items={
            backUrl
              ? [
                  {
                    href: backUrl || '#',
                    label: 'Retour',
                  },
                  {
                    href: '#',
                    label: 'Payment',
                  },
                ]
              : []
          }
        />
      </div>
    </div>
  );
};
