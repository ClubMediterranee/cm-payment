import {
  type CapsEmbedError,
  type CapsEnv,
  type CapsFlowType,
  CapsFormSlot,
  CapsFormWebComponent,
  type CapsIssuerType,
} from '@clubmed/caps/webcomponent';
import { type FormEvent, type ReactNode, useState } from 'react';

/**
 * `sidebar` emulates the client pages: the donation and the pay button live in a sidebar, outside the form.
 */
type Layout = 'sidebar' | 'inline';

type PlaygroundConfig = {
  layout: Layout;
  /**
   * `local` targets `capsUrl`, other values target the CAPS server of the environment.
   */
  env: 'local' | CapsEnv;
  capsUrl: string;
  issuerType: CapsIssuerType;
  type: CapsFlowType;
  id: string;
  customerId: string;
  locale: string;
  accessToken: string;
};

const DEFAULT_CONFIG: PlaygroundConfig = {
  layout: 'sidebar',
  env: 'local',
  capsUrl: 'http://localhost:8083',
  issuerType: 'GM',
  type: 'proposal',
  id: '',
  customerId: '',
  locale: 'fr-FR',
  accessToken: '',
};

// The token is never stored in the URL.
const URL_KEYS: Record<Exclude<keyof PlaygroundConfig, 'accessToken'>, string> = {
  layout: 'layout',
  env: 'env',
  capsUrl: 'caps_url',
  issuerType: 'issuer',
  type: 'type',
  id: 'id',
  customerId: 'customer_id',
  locale: 'locale',
};

function readConfigFromUrl(): { config: PlaygroundConfig; submitted: boolean } {
  const params = new URLSearchParams(window.location.search);
  const config = { ...DEFAULT_CONFIG };

  Object.entries(URL_KEYS).forEach(([key, param]) => {
    const value = params.get(param);

    if (value) {
      (config as Record<string, string>)[key] = key === 'issuerType' ? value.toUpperCase() : value;
    }
  });

  return { config, submitted: !!config.id };
}

function writeConfigToUrl(config: PlaygroundConfig) {
  const params = new URLSearchParams();

  Object.entries(URL_KEYS).forEach(([key, param]) => {
    const value = config[key as keyof typeof URL_KEYS];

    if (value && value !== DEFAULT_CONFIG[key as keyof typeof URL_KEYS]) {
      params.set(param, value);
    }
  });

  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

/**
 * Same rules as the CAPS flow: bookings and seller flows need a token, sellers a customer id.
 */
function validate(config: PlaygroundConfig): string[] {
  const errors: string[] = [];

  if (!config.id.trim()) {
    errors.push(`${config.type === 'proposal' ? 'Proposal' : 'Booking'} id is required.`);
  }

  if (config.issuerType !== 'GM' && !config.customerId.trim()) {
    errors.push(`Customer id is required for ${config.issuerType} flows.`);
  }

  if (!config.accessToken && (config.type === 'booking' || config.issuerType !== 'GM')) {
    errors.push(`An access token is required for ${config.issuerType} ${config.type} flows.`);
  }

  if (config.env === 'local' && !/^https?:\/\//.test(config.capsUrl)) {
    errors.push('The CAPS url must start with http:// or https://.');
  }

  return errors;
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-semibold">{label}</span>
    {children}
  </label>
);

const inputClass = 'rounded border border-slate-300 bg-white px-2 py-1';

function ConfigForm({
  initial,
  onSubmit,
}: {
  initial: PlaygroundConfig;
  onSubmit: (config: PlaygroundConfig) => void;
}) {
  const [config, setConfig] = useState(initial);
  const [errors, setErrors] = useState<string[]>([]);

  const set =
    <K extends keyof PlaygroundConfig>(key: K) =>
    (event: { target: { value: string } }) =>
      setConfig((current) => ({ ...current, [key]: event.target.value as PlaygroundConfig[K] }));

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(config);
    setErrors(nextErrors);

    if (!nextErrors.length) {
      onSubmit({ ...config, id: config.id.trim(), customerId: config.customerId.trim() });
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4" data-testid="playground-form">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field label="Layout">
          <select className={inputClass} value={config.layout} onChange={set('layout')}>
            <option value="sidebar">Sidebar (donation + pay)</option>
            <option value="inline">Inline</option>
          </select>
        </Field>
        <Field label="Issuer">
          <select className={inputClass} value={config.issuerType} onChange={set('issuerType')}>
            <option value="GM">GM</option>
            <option value="GO">GO</option>
            <option value="PARTNERS">PARTNERS</option>
          </select>
        </Field>
        <Field label="Type">
          <select className={inputClass} value={config.type} onChange={set('type')}>
            <option value="proposal">Proposal</option>
            <option value="booking">Booking</option>
          </select>
        </Field>
        <Field label="Locale">
          <input className={inputClass} value={config.locale} onChange={set('locale')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={config.type === 'proposal' ? 'Proposal id *' : 'Booking id *'}>
          <input
            className={inputClass}
            name="id"
            value={config.id}
            onChange={set('id')}
            placeholder="e.g. 12345678"
          />
        </Field>
        <Field label={`Customer id${config.issuerType === 'GM' ? ' (optional)' : ' *'}`}>
          <input
            className={inputClass}
            name="customer_id"
            value={config.customerId}
            onChange={set('customerId')}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CAPS server">
          <select className={inputClass} value={config.env} onChange={set('env')}>
            <option value="local">Local / custom url</option>
            <option value="integration">integration</option>
            <option value="staging">staging</option>
            <option value="production">production</option>
          </select>
        </Field>
        {config.env === 'local' && (
          <Field label="CAPS url">
            <input className={inputClass} value={config.capsUrl} onChange={set('capsUrl')} />
          </Field>
        )}
      </div>

      <Field label="Access token (optional for a GM proposal, never stored in the url)">
        <textarea
          className={`${inputClass} font-mono text-xs`}
          rows={2}
          value={config.accessToken}
          onChange={set('accessToken')}
        />
      </Field>

      {errors.length > 0 && (
        <ul className="text-sm text-red-600" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div>
        <button type="submit" data-testid="load-caps">
          Load the CAPS form
        </button>
      </div>
    </form>
  );
}

export function App() {
  const [{ config, submitted }, setState] = useState(readConfigFromUrl);
  const [loadKey, setLoadKey] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) =>
    setEvents((current) => [...current, `${new Date().toLocaleTimeString()} ${event}`]);

  const load = (next: PlaygroundConfig) => {
    writeConfigToUrl(next);
    setEvents([]);
    setLoadKey((key) => key + 1);
    setState({ config: next, submitted: true });
  };

  const flowProps = {
    ...(config.env === 'local' ? { url: config.capsUrl } : { env: config.env }),
    issuerType: config.issuerType,
    type: config.type,
    id: config.id,
    customerId: config.customerId || undefined,
    locale: config.locale || undefined,
    accessToken: config.accessToken || undefined,
    callbackUrl: `${window.location.origin}/callback`,
    fallback: <p data-testid="caps-fallback">Loading CAPS…</p>,
    onReady: () => log('ready'),
    onLoadingChange: (loading: boolean) => log(`loading: ${loading}`),
    onError: (error: CapsEmbedError) => log(`error: ${error.code} ${error.message}`),
    onRedirect: (url: string) => log(`redirect: ${url}`),
  } as Parameters<typeof CapsFormWebComponent>[0];

  const sidebar = config.layout === 'sidebar';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">CAPS embed playground (React 19, Tailwind v4)</h1>
      </header>

      <main className="mx-auto w-full max-w-[1600px] p-6 grid gap-6">
        <section className="rounded-(--radius) border p-4">
          <h2>Flow</h2>
          <ConfigForm initial={config} onSubmit={load} />
        </section>

        {submitted && (
          <section data-testid="caps-container">
            <p className="mb-4 text-xs">
              {sidebar ? 'sidebar' : 'inline'} · {config.issuerType} {config.type} {config.id}
              {config.customerId && ` · customer ${config.customerId}`} ·{' '}
              {config.env === 'local' ? config.capsUrl : config.env}
            </p>
            <div
              className={sidebar ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] items-start' : ''}
            >
              <div className="rounded-lg border p-4" style={{ transform: 'translateZ(0)' }}>
                <CapsFormWebComponent key={loadKey} {...flowProps} />
              </div>
              {sidebar && (
                <aside
                  className="sticky top-20 grid gap-4 rounded-lg border bg-slate-50 p-4"
                  data-testid="caps-sidebar"
                >
                  <div>
                    <h2 className="text-lg font-bold">Your stay</h2>
                    <p className="text-sm text-slate-600">
                      Host content: summary, prices, insurance…
                    </p>
                  </div>
                  <CapsFormSlot name="donation" />
                  <CapsFormSlot name="submit" />
                </aside>
              )}
            </div>
          </section>
        )}

        <section className="rounded-lg border p-4">
          <h2>Events</h2>
          <ul data-testid="caps-events" className="text-sm">
            {events.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
