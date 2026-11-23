import { formatDate, formatTemplate, FormPanel as Panel, renderTemplate } from '@clubmed/caps';
import { Icon } from '@clubmed/trident-icons';
import { Card } from '@clubmed/trident-ui/ui/cards/Card';
import { Chip } from '@clubmed/trident-ui/ui/Chip';
import { Image } from '@clubmed/trident-ui/ui/Image';
import { Tag } from '@clubmed/trident-ui/ui/Tag';

import { useContent } from '../hooks/useContent';
import { useProduct } from '../hooks/useProduct';
import type { StayModel } from '../hooks/useStay.js';
import { useAppContext } from '../providers/AppProvider';

export const StayPlaceholder = () => {
  const { app } = useContent();

  return (
    <div className="w-full">
      <Card>
        <Chip theme="solid" color="lightSand" size="size-48">
          <Icon name="Trident" width="24px" />
        </Chip>
        <h3 className="text-18 font-bold mt-12 mb-8">{app.stay.placeholder}</h3>
      </Card>
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
  const { app } = useContent();

  const { id } = useAppContext();

  return (
    <Panel className="bg-white w-full mb-40">
      <div className="flex flex-col md:flex-row gap-20">
        <Image
          src={product.media?.immersive_image || ''}
          alt={product.destination?.countries?.[0].label}
          className="rounded-16"
          style={{ height: 185 }}
        />
        <div className="w-full md:max-w-1/2 flex flex-col justify-between">
          <div>
            <p className="text-sienna font-bold text-b4">
              {product?.destination?.countries?.[0].label}
            </p>
            <p className="font-bold text-b2">{product?.title}</p>
            <div className="flex flex-col gap-6">
              <Tag
                label={formatTemplate(app.stay.dates, {
                  start: formatStayDate(stay.resortArrivalDate),
                  end: formatStayDate(stay.resortDepartureDate),
                })}
                theme="none"
                icon="CalendarDefault"
                backgroundColor="lightSand"
                className="w-max"
                labelClassName="font-normal"
                iconWidth="1rem"
              />
              {!!stay.adultsCount && (
                <Tag
                  label={
                    stay.childrenCount
                      ? formatTemplate(app.stay.adultsAndChildren, {
                          adults: stay.adultsCount,
                          children: stay.childrenCount,
                        })
                      : formatTemplate(app.stay.adults, { adults: stay.adultsCount })
                  }
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
          <p className="font-bold text-b4">
            {renderTemplate(app.stay.reference, { id }, { asFragment: true })}
          </p>
        </div>
      </div>
    </Panel>
  );
};
