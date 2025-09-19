import { Card } from "@clubmed/trident-ui/molecules/Card";
import { useProduct } from "../data/useProduct";

export const StayPlaceholder = () => {
  return (
    <div className="w-full">
      <Card />
    </div>
  );
};

export const Stay = ({
  stay,
}: {
  stay: {
    product_id: string;
    resort_arrival_date: string;
    resort_departure_date: string;
    accommodations: string[];
  };
}) => {
  const { data: product } = useProduct({ productId: stay.product_id });
  

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
              Du {stay.resort_arrival_date} au {stay.resort_departure_date}
            </p>
            <p>{stay.accommodations.length} chambre(s)</p>
          </div>
          <img
            src={product.immersive_image}
            alt={product.destination?.countries?.[0].label}
            className="rounded-16 w-full"
            style={{ height: 200 }}
          />
        </div>
      </Card>
    </div>
  );
};
