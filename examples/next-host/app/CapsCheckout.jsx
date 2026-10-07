'use client';

import { CapsFormWebComponent } from '@clubmed/caps/webcomponent';
import { useState } from 'react';

export function CapsCheckout(flow) {
  const [events, setEvents] = useState([]);
  const log = (event) => setEvents((current) => [...current, event]);

  return (
    <>
      <CapsFormWebComponent
        {...flow}
        callbackUrl="http://localhost:4008/callback"
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
    </>
  );
}
