import { Breadcrumb } from '@clubmed/trident-ui/ui/Breadcrumb';

import { useBackUrl } from '../hooks/useBackUrl';
import { useProduct } from '../hooks/useProduct';
import { useStay } from '../hooks/useStay';

export const ImmersiveBreadcrumb = () => {
  const backUrl = useBackUrl();
  const { stay } = useStay();

  const { data: product } = useProduct(stay);

  const immersiveImageUrl = product?.media?.immersive_image;

  return (
    <div className="relative w-full">
      {immersiveImageUrl && (
        <div className="absolute top-0 left-0 w-full h-[260px] overflow-hidden">
          <div className="absolute inset-0 flex items-center opacity-25">
            <div className="flex-1 h-full">
              <div className="h-full">
                <div
                  className="absolute top-0 left-0 h-full w-full animate-fadeIn bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${immersiveImageUrl})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative py-32 max-w-2/3 mx-auto z-10">
        <Breadcrumb
          items={
            backUrl
              ? [
                  {
                    href: backUrl,
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
