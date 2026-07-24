import { Icon } from '@clubmed/trident-icons';
import { Radio } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { PropsWithChildren, useState } from 'react';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useDisclosure } from '../hooks/utils/useDisclosure';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';
import { FormPanel } from './ui/FormPanel';
import { Popin } from './ui/Popin';
import { TitleSkeleton } from './ui/skeletons';

const NOT_THIS_TIME = '0';
const FREE_AMOUNT = 'free';

export const Donation = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const { content, locale } = useCapsConfigContext();
  const { setValue, formState } = useFormContext();
  const { data: paymentConfig } = usePaymentConfig();

  const { isOpen: isModalOpen, onOpen, onClose } = useDisclosure();
  const [isFreeAmountMode, setIsFreeAmountMode] = useState(false);

  const donationAmount = useWatch('donation_amount');
  const error = formState.errors.donation_amount?.message;

  const {
    paymentSchedule: [{ currency }],
  } = usePaymentSchedule();

  if (!paymentConfig?.feature_flips?.is_donation_enabled) {
    return null;
  }

  const handleRadioChange = (value: typeof FREE_AMOUNT | typeof NOT_THIS_TIME | number) => {
    setIsFreeAmountMode(value === FREE_AMOUNT);
    setValue(
      'donation_amount',
      value === FREE_AMOUNT || value === NOT_THIS_TIME ? undefined : value,
    );
  };

  const handleCustomAmountChange = (_: string, value: string) => {
    setValue('donation_amount', Number(value || 0));
  };

  return (
    <div className={className}>
      {children}
      <div>
        <FormPanel className="flex flex-row gap-10">
          <div className="flex flex-col gap-20">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-h6 font-bold mb-8">{content.donation.title}</h3>
                <p className="text-b3">
                  {content.donation.description}{' '}
                  <Icon
                    name="Information"
                    width="1.25rem"
                    onClick={onOpen}
                    className="cursor-pointer"
                    aria-label="Information about donation"
                  />
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-20 w-full md:max-w-3/5">
                <Radio
                  name="donation_radio"
                  checked={!donationAmount && !isFreeAmountMode}
                  onChange={() => handleRadioChange(NOT_THIS_TIME)}
                  aria-label={content.donation.notThisTime}
                >
                  {content.donation.notThisTime}
                </Radio>

                <div className="flex flex-col md:flex-row justify-between gap-20">
                  {GLOBAL_CAPS_SETTINGS.donation.presetAmounts.map((amount) => {
                    const formattedAmount = formatCurrency({ amount, currency, locale });
                    return (
                      <Radio
                        key={amount}
                        name="donation_radio"
                        checked={donationAmount === amount}
                        onChange={() => handleRadioChange(amount)}
                        aria-label={formattedAmount}
                      >
                        {formattedAmount}
                      </Radio>
                    );
                  })}
                </div>

                <Radio
                  name="donation_radio"
                  checked={isFreeAmountMode}
                  onChange={() => handleRadioChange(FREE_AMOUNT)}
                  aria-label={content.donation.freeAmount}
                >
                  {content.donation.freeAmount}
                </Radio>
              </div>

              {isFreeAmountMode && (
                <div className="w-full md:max-w-1/4 ml-0 md:ml-32 relative">
                  <TextField
                    type="number"
                    value={donationAmount?.toString() || ''}
                    onChange={handleCustomAmountChange}
                    errorMessage={error}
                    placeholder="0"
                  />
                  <span className="absolute right-20 top-1/2 -translate-y-1/2 text-b3 text-grey-dark pointer-events-none">
                    {getCurrencySymbol({ currency, locale })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Icon name="AllInclusiveDonations" width="5rem" />
        </FormPanel>

        <Popin isVisible={isModalOpen} onClose={onClose}>
          <img
            src={content.donation.imageUrl}
            alt={content.donation.popinTitle}
            className="w-full "
          />
          <div className="p-20 flex flex-col gap-10">
            <h3 className="text-b2 font-serif">{content.donation.popinTitle}</h3>
            <p className="text-b5">{content.donation.popinDescription}</p>
            <p className="text-b5">{content.donation.popinFiscalInfo}</p>
          </div>
        </Popin>
      </div>
    </div>
  );
};

const DonationSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <div className="flex gap-4 animate-pulse">
        <div className="w-16 h-16 bg-grey-light rounded"></div>
        <div className="flex-1 h-16 bg-grey-light rounded"></div>
      </div>
    </FormPanel>
  </div>
);

Donation.Skeleton = DonationSkeleton;
Donation.COMPONENT_KEY = TOKENS.Donation;
