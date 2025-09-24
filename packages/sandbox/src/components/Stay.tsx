import {Card} from "@clubmed/trident-ui/molecules/Card";
import {useProduct} from "../hooks/useProduct";
import type {StayModel} from "../hooks/useStay.js";

export const StayPlaceholder = () => {
  return (
    <div className="w-full">
      <Card title="Stay placeholder" icon="Trident"/>
    </div>
  );
};

export type StayProps = {
  stay: StayModel;
}

export const Stay = ({stay}: StayProps) => {
  const {data: product} = useProduct(stay);


  return (
    <div className="w-full pb-20">
      <Card title={product?.full_title} icon="OnDemand">
        <div className="flex flex-col md:flex-row justify-between gap-24">
          <div className="w-full md:max-w-1/2 flex justify-between flex-col">
            <p className="text-sienna font-bold">
              {product?.destination?.countries?.[0].label}
            </p>
            <p className="text-grey">
              {product?.accommodations_introduction?.description}
            </p>
            <p className="font-bold">
              Du {stay.resortArrivalDate} au {stay.resortDepartureDate}
            </p>
            <p>{stay.nbAccommodations} chambre(s)</p>
          </div>
          <img
            src={product.media?.immersive_image}
            alt={product.destination?.countries?.[0].label}
            className="rounded-16 w-full"
            style={{height: 200}}
          />
        </div>
      </Card>
    </div>
  );
};
