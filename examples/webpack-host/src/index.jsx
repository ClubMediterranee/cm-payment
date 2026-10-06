import { CapsFormWebComponent } from '@clubmed/caps/webcomponent';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

const params = new URLSearchParams(window.location.search);

function App() {
  const [events, setEvents] = useState([]);
  const log = (event) => setEvents((current) => [...current, event]);

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>webpack 5 host</h1>
      <CapsFormWebComponent
        url={params.get('caps_url') || 'http://localhost:8083'}
        issuerType={params.get('issuer') || 'GM'}
        type={params.get('type') || 'proposal'}
        id={params.get('id') || '2057923'}
        customerId={params.get('customer_id') || undefined}
        callbackUrl={`${window.location.origin}/callback`}
        fallback={<p>Loading CAPS…</p>}
        onReady={() => log('ready')}
        onError={(error) => log(`error: ${error.code} ${error.message}`)}
        onRedirect={(url) => {
          log(`redirect: ${url}`);
          return false;
        }}
      />
      <ul id="caps-events">
        {events.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </main>
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
