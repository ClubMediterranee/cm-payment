import { Button } from '@clubmed/trident-ui/ui/buttons/Button';
import { Checkbox } from '@clubmed/trident-ui/ui/forms/checkboxes/index';
import { FormControl } from '@clubmed/trident-ui/ui/forms/FormControl';
import { Switch } from '@clubmed/trident-ui/ui/forms/Switch';
import { TextField } from '@clubmed/trident-ui/ui/forms/TextField';
import { Icon } from '@clubmed/trident-icons';
import { PropsWithChildren, useCallback, useEffect, useId, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';
import { GLOBAL_CAPS_SETTINGS } from '../config';
import { usePaymentConfig } from '../hooks/data/usePaymentConfig';
import { usePaymentSchedule } from '../hooks/data/usePaymentSchedule';
import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useDisclosure } from '../hooks/utils/useDisclosure';
import { useFormContext, useWatch } from '../hooks/utils/useForm';
import { useWatchedPaymentProvider } from '../hooks/utils/useWatchedPaymentProvider';
import { TOKENS } from '../types/Tokens';
import { renderTemplate } from '../utils/renderTemplate';
import { FormPanel } from './ui/FormPanel';
import { InfoPopin } from './ui/InfoPopin';
import { TitleSkeleton } from './ui/skeletons';

type DonationErrors = Partial<Record<'consent' | 'amount' | 'otherAmount', string>>;

const PRESET_AMOUNTS: readonly number[] = GLOBAL_CAPS_SETTINGS.donation.presetAmounts;

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message && (
    <p id={id} role="alert" className="text-b4 text-red">
      {message}
    </p>
  );

export const Donation = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const { content, locale } = useCapsConfigContext();
  const { setValue, formState } = useFormContext();
  const { data: paymentConfig } = usePaymentConfig();
  const watchedProvider = useWatchedPaymentProvider();

  const { isOpen: isModalOpen, onOpen, onClose } = useDisclosure();
  const panelId = useId();
  const switchId = useId();

  const donationAmount = useWatch('donation_amount');
  const hasConsent = !!useWatch('cgv_donation');

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(() =>
    PRESET_AMOUNTS.find((amount) => amount === donationAmount),
  );
  const [isOtherAmount, setIsOtherAmount] = useState(
    () => !!donationAmount && !PRESET_AMOUNTS.includes(donationAmount),
  );
  const [otherAmount, setOtherAmount] = useState(() =>
    isOtherAmount ? String(donationAmount) : '',
  );
  const [errors, setErrors] = useState<DonationErrors>({});

  const {
    paymentSchedule: [{ currency }],
  } = usePaymentSchedule();

  const isSplitPayment =
    watchedProvider?.category_payment_method ===
    PaymentProvider1CategoryPaymentMethod.BuyNowPayLater;

  const removeDonation = useCallback(() => {
    setValue('donation_amount', undefined, { shouldValidate: true });
    setValue('cgv_donation', false);
    setSelectedAmount(undefined);
    setIsOtherAmount(false);
    setOtherAmount('');
    setErrors({});
    setIsOpen(false);
  }, [setValue]);

  useEffect(() => {
    if (isSplitPayment) removeDonation();
  }, [isSplitPayment, removeDonation]);

  if (!paymentConfig?.feature_flips?.is_donation_enabled || isSplitPayment) {
    return null;
  }

  const draftAmount = isOtherAmount ? Number(otherAmount) : selectedAmount;
  const isConfirmed = !!donationAmount;
  const isModified = isConfirmed && draftAmount !== donationAmount;
  const consentError = errors.consent ?? formState.errors.cgv_donation?.message;

  const clearError = (field: keyof DonationErrors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(selectedAmount === amount ? undefined : amount);
    setIsOtherAmount(false);
    setErrors((current) => ({ ...current, amount: undefined, otherAmount: undefined }));
  };

  const handleOtherAmountToggle = (_event: Event, checked: boolean) => {
    setIsOtherAmount(checked);
    setSelectedAmount(undefined);
    setErrors((current) => ({ ...current, amount: undefined, otherAmount: undefined }));
  };

  const handleOtherAmountChange = (_event: Event, value: string) => {
    setOtherAmount(value);
    clearError('otherAmount');
  };

  const handleConsentChange = (_event: Event, checked: boolean) => {
    setValue('cgv_donation', checked, { shouldValidate: true });
    if (checked) clearError('consent');
  };

  const handleConfirm = () => {
    const nextErrors: DonationErrors = {
      amount: !isOtherAmount && !selectedAmount ? content.donation.errors.noAmount : undefined,
      otherAmount:
        isOtherAmount && !(draftAmount && draftAmount > 0)
          ? content.donation.errors.invalidAmount
          : undefined,
      consent: hasConsent ? undefined : content.donation.validation.mustAccept,
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setValue('donation_amount', draftAmount, { shouldValidate: true });
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);

  return (
    <div className={twMerge('@container', className)}>
      {children}
      <div
        className={twMerge(
          'flex w-full flex-col items-end justify-end rounded-16 bg-white p-12 transition-colors',
          isOpen ? 'gap-20 border-2 border-black' : 'border border-lightGrey',
        )}
      >
        <div className="flex w-full items-center gap-12">
          <label
            htmlFor={switchId}
            className="min-w-0 flex-1 cursor-pointer text-b4 font-semibold text-black"
          >
            {content.donation.title}
          </label>
          <Switch
            id={switchId}
            checked={isOpen}
            onChange={(_event, checked) => setIsOpen(checked)}
            aria-expanded={isOpen}
            aria-controls={panelId}
          />
        </div>

        {isOpen && (
          <div id={panelId} className="flex w-full flex-col gap-20">
            <div className="flex w-full flex-row gap-20">
              <p className="min-w-0 flex-1 text-b4 text-black">{content.donation.description}</p>
              <button
                type="button"
                onClick={onOpen}
                aria-label={content.donation.infoLabel}
                aria-haspopup="dialog"
                className="h-fit shrink-0 cursor-pointer"
              >
                <Icon name="Information" width="24px" className="text-black" aria-hidden="true" />
              </button>
            </div>

            <div className="flex w-full flex-col gap-12">
              <fieldset
                aria-label={content.donation.title}
                aria-describedby={errors.amount ? `${panelId}-amount-error` : undefined}
                className="flex w-full min-w-0 flex-row gap-8"
              >
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    theme={selectedAmount === amount ? 'solid' : 'outline'}
                    color="black"
                    variant="pill"
                    size="medium"
                    aria-pressed={selectedAmount === amount}
                    onClick={() => handlePresetClick(amount)}
                    className="min-w-0 flex-1 px-8"
                  >
                    {formatAmount(amount)}
                  </Button>
                ))}
              </fieldset>
              <FieldError id={`${panelId}-amount-error`} message={errors.amount} />

              <div className="flex w-full flex-col gap-8">
                <Checkbox checked={isOtherAmount} onChange={handleOtherAmountToggle}>
                  <span className="text-b3">{content.donation.otherAmount}</span>
                </Checkbox>
                {isOtherAmount && (
                  <div className="flex w-full flex-row items-center gap-12 rounded-16 bg-pearl p-12">
                    <TextField
                      type="number"
                      inputMode="decimal"
                      label=""
                      value={otherAmount}
                      onChange={handleOtherAmountChange}
                      placeholder={content.donation.otherAmountPlaceholder}
                      aria-label={content.donation.otherAmount}
                      validationStatus={errors.otherAmount ? 'error' : 'default'}
                      errorMessage={errors.otherAmount}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>

              <FormControl
                errorMessage={consentError}
                validationStatus={consentError ? 'error' : 'default'}
              >
                <Checkbox
                  checked={hasConsent}
                  onChange={handleConsentChange}
                  validationStatus={consentError ? 'error' : 'default'}
                  aria-invalid={!!consentError}
                >
                  <span className={twMerge('text-b3', consentError && 'text-red')}>
                    {renderTemplate(content.donation.terms, {}, { asFragment: true })}
                  </span>
                </Checkbox>
              </FormControl>
            </div>

            <div className="flex w-fit flex-col items-end justify-center gap-10 self-end">
              <Button
                type="button"
                color="black"
                theme="solid"
                variant="pill"
                size="tertiary"
                onClick={isConfirmed && !isModified ? removeDonation : handleConfirm}
              >
                {isConfirmed && !isModified
                  ? renderTemplate(content.donation.remove, {
                      amount: formatAmount(donationAmount),
                    })
                  : content.donation.confirm}
              </Button>
            </div>
          </div>
        )}

        <InfoPopin
          isVisible={isModalOpen}
          onClose={onClose}
          closeLabel={content.donation.closeLabel}
          title={content.donation.popinTitle}
          media={
            <img
              src={content.donation.imageUrl}
              alt=""
              className="h-238 w-full object-cover sm:h-330"
            />
          }
        >
          <p>
            {content.donation.popinDescription}
            <br />
            {content.donation.popinFiscalInfo}
          </p>
        </InfoPopin>
      </div>
    </div>
  );
};

const DonationSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <div className="flex gap-4 animate-pulsation">
        <div className="w-16 h-16 bg-lightGrey rounded-4"></div>
        <div className="flex-1 h-16 bg-lightGrey rounded-4"></div>
      </div>
    </FormPanel>
  </div>
);

Donation.Skeleton = DonationSkeleton;
Donation.COMPONENT_KEY = TOKENS.Donation;
