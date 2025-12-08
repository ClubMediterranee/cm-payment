import { FormPanel as Panel } from '@clubmed/payment-sdk/components/ui/FormPanel.js';
import { useCapsConfigContext } from '@clubmed/payment-sdk/hooks/utils/useCapsConfigContext.js';
import { formatDate } from '@clubmed/payment-sdk/utils/formatDate.js';
import { Image } from '@clubmed/trident-ui/atoms/Image/Image';
import { Card } from '@clubmed/trident-ui/molecules/Card';
import { Tag } from '@clubmed/trident-ui/molecules/Tag';

import { useProduct } from '../hooks/useProduct';
import type { StayModel } from '../hooks/useStay.js';

export const StayPlaceholder = () => {
  return (
    <div className="w-full">
      <Card title="Stay placeholder" icon="Trident" />
    </div>
  );
};

export type StayProps = {
  stay: StayModel;
};

const formatStayDate = (date?: string | null) => {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const Stay = ({ stay }: StayProps) => {
  const { data: product } = useProduct(stay);

  const { id } = useCapsConfigContext();

  return (
    <Panel className="bg-white w-full mb-40">
      <div className="flex flex-col md:flex-row gap-20">
        <Image
          src={product.media?.immersive_image || ''}
          alt={product.destination?.countries?.[0].label}
          className="rounded-16"
          style={{ height: 200 }}
        />
        <div className="w-full md:max-w-1/2 flex flex-col justify-between">
          <div>
            <p className="text-sienna font-bold text-b4">
              {product?.destination?.countries?.[0].label}
            </p>
            <p className="font-bold text-b2">{product?.title}</p>
            <div className="flex flex-col gap-6">
              <Tag
                label={`A partir de ${formatStayDate(stay.resortArrivalDate)} au ${formatStayDate(stay.resortDepartureDate)}`}
                theme="none"
                icon="CalendarDefault"
                backgroundColor="lightSand"
                className="w-max"
                labelClassName="font-normal"
                iconWidth="1rem"
              />
              {!!stay.adultsCount && (
                <Tag
                  label={`Pour ${stay.adultsCount} adultes${stay.childrenCount ? ` et ${stay.childrenCount} enfants` : ''}`}
                  theme="none"
                  icon="PeopleDouble"
                  backgroundColor="lightSand"
                  className="w-max"
                  labelClassName="font-normal"
                  iconWidth="1rem"
                />
              )}
            </div>
          </div>
          <p className="font-bold text-b4">Réference {id}</p>
        </div>
      </div>
    </Panel>
  );
};
