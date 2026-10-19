import { Icon, type IconicNames } from '@clubmed/trident-icons';

import { useBackUrl } from '../hooks/useBackUrl';
import { useProduct } from '../hooks/useProduct';
import { useStay } from '../hooks/useStay';
import { useAppContext } from '../providers/AppProvider';

const HeaderBanner = () => {
  const { stay } = useStay();
  const { data: product } = useProduct(stay);

  return (
    <div className="relative overflow-hidden bg-lightSand">
      <div className="relative mx-auto flex w-10/12 max-w-1200 items-center gap-48 py-32 md:min-h-288">
        {stay.productId && (
          <Icon
            name={`${stay.productId}_Outline` as IconicNames}
            width="10rem"
            aria-hidden
            className="hidden shrink-0 text-verdigris opacity-60 md:block"
          />
        )}
        <div>
          <p className="mb-8 text-b3">Your stay at:</p>
          <p className="font-serif text-h2 font-bold italic md:text-h0">{product.title}</p>
        </div>
      </div>
      <Icon
        name="Trident"
        width="5rem"
        aria-hidden
        className="pointer-events-none absolute right-[10%] top-1/2 hidden -translate-y-1/2 text-sand md:block"
      />
    </div>
  );
};

export const HeaderCurrent = () => {
  const { id } = useAppContext();
  const backUrl = useBackUrl();

  return (
    <div className="w-full">
      <header className="grid h-72 grid-cols-3 items-center bg-white px-40">
        <div>
          {backUrl && (
            <a href={backUrl} className="inline-flex items-center gap-16 text-b4">
              <Icon name="ArrowDefaultLeft" width="0.75rem" />
              Retour
            </a>
          )}
        </div>
        <Icon name="ClubMed" width="10rem" className="justify-self-center" />
      </header>
      {id && <HeaderBanner />}
    </div>
  );
};
