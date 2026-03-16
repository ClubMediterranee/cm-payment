import { OidcIssuerTypes } from '@clubmed/caps';
import { Button } from '@clubmed/trident-ui/molecules/Buttons/v2/Button';
import { FormControl } from '@clubmed/trident-ui/molecules/Forms/FormControl';
import { Radio, RadioGroup } from '@clubmed/trident-ui/molecules/Forms/Radios';
import { TextField } from '@clubmed/trident-ui/molecules/Forms/TextField';
import { type FormEvent, useState } from 'react';

import { getPaymentUrl } from '../../../sdk/src/utils/url/getPaymentUrl.js';
import { AppSettings } from '../config.js';
import { Select } from './select/index.js';

function useFormStarter() {
  const [oidc, setOidc] = useState<string>(AppSettings.oidc[0].value);
  const [customer_id, setCustomerId] = useState<string>('');
  const [booking_id, setBookingId] = useState<string>('');
  const [proposal_id, setProposalId] = useState<string>('');
  const [locale, setLocale] = useState<string>('fr-FR');

  function getUrl() {
    try {
      return getPaymentUrl(AppSettings.paymentPageUrl, {
        issuerType: oidc as OidcIssuerTypes,
        locale,
        id: proposal_id || booking_id,
        type: proposal_id ? 'proposal' : 'booking',
        customerId: customer_id,
        extraParams: {},
      });
    } catch {
      return import.meta.env.VITE_PAYMENT_PAGE_URL;
    }
  }

  async function onSubmit(evt: FormEvent) {
    evt.stopPropagation();
    evt.preventDefault();

    window.location.href = getUrl();

    // try {
    //   // await manager?.grant(
    //   //   grantType,
    //   //   mapGrantOptions({ locale, client, provider, responseType, scopes, acrValues, prompt, authorizationEndpoint })
    //   // );
    // } catch (er: any) {
    //   // toastr.error("Flow OIDC", `Unable to create flow: missing or wrong ${er.message}`);
    // }

    return false;
  }

  function onChange(name: string | undefined, value: string) {
    switch (name) {
      case 'oidc':
        setOidc(value);
        break;
      case 'customer_id':
        setCustomerId(value);
        break;
      case 'booking_id':
        setBookingId(value);
        break;
      case 'proposal_id':
        setProposalId(value);
        break;
      case 'locale':
        setLocale(value);
        break;
      default:
        break;
    }
  }

  return {
    values: {
      oidc,
      customer_id,
      proposal_id,
      booking_id,
      locale,
    },
    onChange,
    locales: AppSettings.locales,
    oidcChoices: AppSettings.oidc,
    onSubmit,
    getUrl,
    isInvalid() {
      return getUrl() === import.meta.env.VITE_PAYMENT_PAGE_URL;
    },
  };
}

export function FormStarter() {
  const { getUrl, oidcChoices, onChange, onSubmit, locales, values, isInvalid } = useFormStarter();

  return (
    <div className="flex flex-col px-20">
      <form onSubmit={onSubmit} noValidate={true} className="flex flex-col gap-20">
        <FormControl label="Locale" id="locale">
          <Select
            id="locale"
            options={locales}
            name="locale"
            value={values.locale}
            onChange={onChange}
          />
        </FormControl>

        <FormControl label="Select an OIDC" id="oidc">
          <RadioGroup
            name="oidc"
            className="mt-16 flex-wrap"
            value={values.oidc}
            onChange={onChange}
          >
            {oidcChoices.map((option) => {
              return (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              );
            })}
          </RadioGroup>
        </FormControl>

        {values.oidc === OidcIssuerTypes.GM && (
          <div>
            <TextField
              name="customer_id"
              label="Customer ID"
              value={values.customer_id || ''}
              onChange={onChange}
            />
          </div>
        )}

        <div>
          <TextField
            name="proposal_id"
            label="Use a Proposal ID"
            value={values.proposal_id || ''}
            onChange={onChange}
          />
        </div>

        <div>
          <TextField
            name="booking_id"
            label="Use a Booking ID"
            value={values.booking_id || ''}
            onChange={onChange}
          />
        </div>

        <TextField disabled={true} label="Generated url" value={getUrl()}></TextField>

        <div className="flex flex-col mt-20 justify-center items-center gap-16">
          <Button
            type="submit"
            disabled={isInvalid()}
            className="self-center"
            data-testid="submit-oidc-flow"
          >
            Start flow
          </Button>
        </div>
      </form>
    </div>
  );
}
