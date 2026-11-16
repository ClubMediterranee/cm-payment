import { formatCurrency, FormPanel as Panel, renderTemplate } from '@clubmed/caps';
import { Icon } from '@clubmed/trident-icons';

import { useAppParams } from '../hooks/useAppParams';
import { type AppContent, useContent } from '../hooks/useContent';

const getStatusConfig = (status: string, confirmation: AppContent['confirmation']) => {
  if (status === 'OK') {
    return {
      icon: 'CheckOutlined',
      iconColor: 'text-green',
      bgColor: 'bg-green-light',
      title: confirmation.paymentValidated,
      titleColor: 'text-green',
    };
  }
  return {
    icon: 'CrossOutlined',
    iconColor: 'text-red',
    bgColor: 'bg-red-light',
    title: confirmation.paymentFailed,
    titleColor: 'text-red',
  };
};

export const ConfirmationPage = () => {
  const { oidc: { issuerType } = {}, values } = useAppParams() || {};
  const { payment_status, booking_id, payment_amount, payment_currency } = values;
  const { app } = useContent();

  const statusConfig = getStatusConfig(payment_status, app.confirmation);
  const formattedAmount = formatCurrency({
    amount: Number(payment_amount),
    currency: payment_currency,
    locale: values.locale,
  });

  return (
    <div className="flex flex-col gap-20 mx-auto w-10/12 md:max-w-[49rem] py-40">
      <h1 className="text-h3 font-serif text-center">
        {renderTemplate(app.confirmation.title, { issuer: issuerType }, { asFragment: true })}
      </h1>

      <Panel className="bg-white w-full p-0">
        <div className="flex flex-col font-bold">
          <div className="flex justify-between items-center px-20 py-12">
            <span className="text-b3 text-grey-dark">{app.confirmation.myBooking}</span>
            <span className="text-b3 font-mono">{booking_id}</span>
          </div>
          <div className="flex justify-between items-center bg-sienna text-white px-20 py-12">
            <span className="text-b3 ">{app.confirmation.amount}</span>
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
