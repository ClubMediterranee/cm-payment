import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { CapsFormSchema } from '../schemas/capsFormSchema';
import type { FieldMetadata } from '../utils/billing/parseBillingSchema';
import { BillingAddress } from './BillingAddress';

const useBillingSchema = vi.hoisted(() => vi.fn());
const profile = vi.hoisted(() => ({ current: null as object | null }));
const fillWithMainTraveler = vi.hoisted(() => ({ current: undefined as (() => void) | undefined }));

vi.mock('@clubmed/trident-icons', () => ({ Icon: () => null }));
vi.mock('../hooks/data/useBillingSchema', () => ({ useBillingSchema }));
vi.mock('../hooks/useProfilePrefill', () => ({
  useMainTravelerFill: () => fillWithMainTraveler.current,
}));
vi.mock('../hooks/utils/useWatchedPaymentProvider', () => ({
  useWatchedPaymentProvider: () => ({ billing_address_form: true }),
}));
vi.mock('../hooks/utils/useCapsConfigContext', async () => {
  const { defaultContent } =
    await vi.importActual<typeof import('../content/default')>('../content/default');
  return {
    useCapsConfigContext: () => ({
      customerId: '1',
      oidc: { accessToken: 'token' },
      content: defaultContent,
    }),
  };
});
vi.mock('@tanstack/react-query', async () => ({
  ...(await vi.importActual('@tanstack/react-query')),
  useSuspenseQuery: () => ({ data: profile.current }),
}));

const US_FIELDS: FieldMetadata[] = [
  {
    group: 'attendee',
    name: 'first_name',
    path: 'billing_details.attendee.first_name',
    type: 'text',
    required: true,
  },
  {
    group: 'attendee',
    name: 'last_name',
    path: 'billing_details.attendee.last_name',
    type: 'text',
    required: true,
  },
  {
    group: 'address',
    name: 'number',
    path: 'billing_details.address.number',
    type: 'text',
    required: false,
  },
  {
    group: 'address',
    name: 'street',
    path: 'billing_details.address.street',
    type: 'text',
    required: true,
  },
  {
    group: 'address',
    name: 'city',
    path: 'billing_details.address.city',
    type: 'text',
    required: true,
  },
  {
    group: 'address',
    name: 'zip_code',
    path: 'billing_details.address.zip_code',
    type: 'text',
    required: true,
  },
  {
    group: 'address',
    name: 'state_or_district',
    path: 'billing_details.address.state_or_district',
    type: 'select',
    required: true,
    options: [{ value: 'NY', label: 'New York' }],
  },
  {
    group: 'address',
    name: 'town',
    path: 'billing_details.address.town',
    type: 'text',
    required: false,
  },
  {
    group: 'address',
    name: 'additional_information_1',
    path: 'billing_details.address.additional_information_1',
    type: 'text',
    required: false,
  },
];

const Form = ({ children }: { children: ReactNode }) => {
  const methods = useForm<CapsFormSchema>({
    defaultValues: { billing_details: { address: { country_code: 'US' } } },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderBillingAddress = () =>
  render(
    <Form>
      <BillingAddress />
    </Form>,
  );

const controlOf = (element: HTMLElement) => element.closest('[data-name="TextField"]')!;

describe('BillingAddress', () => {
  beforeEach(() => {
    useBillingSchema.mockReturnValue({ data: US_FIELDS });
    fillWithMainTraveler.current = undefined;
  });

  afterEach(() => vi.clearAllMocks());

  it('names each field after its visible label and flags the mandatory ones', () => {
    renderBillingAddress();

    const firstName = screen.getByRole('textbox', { name: 'First Name' });

    expect(firstName).toHaveProperty('required', true);
    expect(controlOf(firstName).querySelector('label')?.textContent).toBe(
      'First Name*Matching Passport/ID',
    );
    expect(screen.getByRole('textbox', { name: 'Street Number' })).toHaveProperty(
      'required',
      false,
    );
    expect(screen.getByText('*Mandatory field')).toBeTruthy();
  });

  it('lays the fields out in the rows of the design', () => {
    renderBillingAddress();

    expect(controlOf(screen.getByRole('textbox', { name: 'Street Number' })).className).toContain(
      'md:w-160',
    );
    expect(controlOf(screen.getByRole('textbox', { name: 'Street' })).className).toContain(
      'md:flex-1',
    );
    expect(screen.getByRole('textbox', { name: 'Town' })).toBeTruthy();
    const names = screen
      .getAllByRole('textbox')
      .map((input) => controlOf(input).querySelector('label span')?.textContent);
    expect(names.slice(0, 7)).toEqual([
      'First Name',
      'Last Name',
      'Street Number',
      'Street',
      'Postal Code',
      'City',
      'Town',
    ]);
  });

  it('shows an empty select without placeholder text', () => {
    renderBillingAddress();

    const state = screen.getByRole<HTMLSelectElement>('combobox', { name: 'State / Province' });
    const [placeholder] = state.options;

    expect(state.value).toBe('');
    expect(placeholder.textContent).toBe('');
    expect(placeholder.hidden).toBe(true);
    expect(state.required).toBe(true);
  });

  it('opens the additional information by default and lets the customer fold it', () => {
    renderBillingAddress();

    const toggle = screen.getByRole('button', { name: 'Additional information' });

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('textbox', { name: 'Additional Information 1' })).toBeTruthy();

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('textbox', { name: 'Additional Information 1' })).toBeNull();
  });

  it('fills the address with the main traveler when «Same as main traveler» is ticked', () => {
    fillWithMainTraveler.current = vi.fn();
    renderBillingAddress();

    const checkbox = screen.getByRole('checkbox', { name: 'Same as main traveler' });
    fireEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', true);
    expect(fillWithMainTraveler.current).toHaveBeenCalledTimes(1);

    fireEvent.click(checkbox);

    expect(checkbox).toHaveProperty('checked', false);
    expect(fillWithMainTraveler.current).toHaveBeenCalledTimes(1);
  });

  it('hides «Same as main traveler» without main traveler profile', () => {
    renderBillingAddress();

    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

describe('BillingAddress.Preload', () => {
  afterEach(() => {
    vi.clearAllMocks();
    profile.current = null;
  });

  it('loads the billing schema of the country of the locale', () => {
    render(<BillingAddress.Preload countryCode="FR" />);

    expect(useBillingSchema).toHaveBeenCalledWith('FR');
  });

  it('loads the billing schema of the country of the profile first', () => {
    profile.current = { address: { country_code: 'CA' } };

    render(<BillingAddress.Preload countryCode="FR" />);

    expect(useBillingSchema).toHaveBeenCalledWith('CA');
  });
});
