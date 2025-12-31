import { FormPanel as Panel } from '@clubmed/caps/components/ui/FormPanel';
import { formatCurrency } from '@clubmed/caps/utils/formatCurrency';
import { Icon } from '@clubmed/trident-icons';
import { useParams } from 'wouter';

import { useQueryParams } from '../hooks/useQueryParams';

type ConfirmationParams = {
  payment_status: string;
  booking_id: string;
  payment_amount: string;
  payment_currency: string;
};

const getStatusConfig = (status: string) => {
  if (status === 'OK') {
    return {
      icon: 'CheckOutlined',
      iconColor: 'text-green',
      bgColor: 'bg-green-light',
      title: 'Votre paiement a été validé',
      titleColor: 'text-green',
    };
  }
  return {
    icon: 'CrossOutlined',
    iconColor: 'text-red',
    bgColor: 'bg-red-light',
    title: 'Votre paiement a échoué',
    titleColor: 'text-red',
  };
};

export const ConfirmationPage = () => {
  const { issuer } = useParams<{ issuer: string }>();
  const params = useQueryParams<ConfirmationParams>();

  const { payment_status, booking_id, payment_amount, payment_currency } = params;

  const statusConfig = getStatusConfig(payment_status);
  const formattedAmount = formatCurrency({
    amount: Number(payment_amount),
    currency: payment_currency,
    locale: 'fr-FR',
  });

  return (
    <div className="flex flex-col gap-20 mx-auto w-10/12 md:max-w-[49rem] py-40">
      <h1 className="text-h3 font-serif text-center">
        Confirmation de paiement - {issuer?.toUpperCase()}
      </h1>

      <Panel className="bg-white w-full p-0">
        <div className="flex flex-col font-bold">
          <div className="flex justify-between items-center px-20 py-12">
            <span className="text-b3 text-grey-dark">Ma réservation</span>
            <span className="text-b3 font-mono">{booking_id}</span>
          </div>
          <div className="flex justify-between items-center bg-sienna text-white px-20 py-12">
            <span className="text-b3 ">Montant</span>
            <span className="text-h5 ">{formattedAmount}</span>
          </div>
        </div>
      </Panel>
      <div className={`flex flex-row items-center gap-16 ${statusConfig.titleColor}`}>
        <Icon className="font-bold" name={statusConfig.icon} width="4em" />
        <h2 className="text-h5 font-serif">{statusConfig.title}</h2>
      </div>
    </div>
  );
};
