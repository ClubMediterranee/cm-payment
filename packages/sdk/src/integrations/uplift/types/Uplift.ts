export enum UpliftStatus {
  OFFER_AVAILABLE = 'OFFER_AVAILABLE',
  TOKEN_AVAILABLE = 'TOKEN_AVAILABLE',
  TOKEN_RETRIEVED = 'TOKEN_RETRIEVED',
  OFFER_UNAVAILABLE = 'OFFER_UNAVAILABLE',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export type UpliftConfiguration = {
  apiKey: string;
  locale: string;
  currency: string;
  checkout: boolean;
  channel: string;
  container: string;
  onChange: (event: UpliftChangeEvent) => void;
};

export type UpliftChangeEvent = {
  status: UpliftStatus;
  token?: {
    card_token: string;
  };
};

export type UpliftOrder = {
  order_amount: number;
  travelers: Array<{
    id?: number;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
  }>;
  billing_contact: {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    street_address?: string;
    city?: string;
    region?: string;
    country?: string;
    postal_code?: string;
  };
  air_reservations: Array<{
    airline_name?: string | null;
    origin?: string | null;
    destination?: string | null;
    trip_type: 'oneway' | 'roundtrip';
    itinerary: Array<{
      departure_apc?: string | null;
      departure_time?: string | null;
      arrival_apc?: string | null;
      arrival_time?: string | null;
      fare_class?: string | null;
      carrier_code?: string | null;
    }>;
  }>;
  hotel_reservations: Array<{
    hotel_name: string;
    number_of_rooms: number;
    reservation_type: string;
    has_deposit: string;
    check_in?: string;
    check_out?: string;
  }>;
  add_ons: Array<unknown>;
};

declare global {
  interface Window {
    Uplift?: {
      Payments: {
        init: (configuration: UpliftConfiguration) => void;
        load: (order: UpliftOrder) => void;
        select: () => void;
        deselect: () => void;
        exit: () => void;
        clear: () => void;
        getToken: () => Promise<string>;
        error: (message: string, level: string) => void;
        confirm: (orderId: string) => void;
      };
      Analytics: {
        orderSubmit: (order: UpliftOrder, options: Record<string, unknown>) => void;
        orderResponse: (options: Record<string, unknown>) => void;
      };
    };
    upReady?: () => void;
    UpLiftPlatformObject?: string;
  }
}
