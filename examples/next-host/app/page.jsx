import { CapsCheckout } from './CapsCheckout';

// Server component: the CAPS wrappers render their fallback on the server and load on the client.
export default async function Page({ searchParams }) {
  const params = await searchParams;

  return (
    <main style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>Next.js host (App Router)</h1>
      <CapsCheckout
        mode={params.mode === 'iframe' ? 'iframe' : 'webcomponent'}
        url={params.caps_url || 'http://localhost:8083'}
        issuerType={params.issuer || 'GM'}
        type={params.type || 'proposal'}
        id={params.id || '2057923'}
        customerId={params.customer_id}
      />
    </main>
  );
}
