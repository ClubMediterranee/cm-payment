import { CapsMessageType } from '@clubmed/caps';
import { type PropsWithChildren, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

import { LoadingPage } from '../pages/LoadingPage';
import { useEmbedded } from './EmbeddedProvider';

const Message = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <div className="flex flex-col items-center gap-16 p-40 text-center" role="alert">
    <h1 className="text-h5 font-serif">{title}</h1>
    {children}
  </div>
);

/**
 * Embedded (iframe) mode guards: allow-listed parent only, and a sign-in fallback when the SSO cannot
 * complete inside the frame (third-party cookies blocked).
 */
export function EmbeddedGate({ children }: PropsWithChildren) {
  const embedded = useEmbedded();
  const auth = useAuth();
  const authError = embedded.active && embedded.status === 'allowed' ? auth.error : undefined;

  useEffect(() => {
    if (embedded.active && authError) {
      embedded.post(CapsMessageType.ERROR, {
        code: 'AUTH_REQUIRED',
        message: authError.message,
      });
    }
  }, [authError]);

  if (!embedded.active) {
    return children;
  }

  // Wait for the host token (or the handshake timeout) before rendering the flow: its first requests would
  // otherwise be sent without the token and fail.
  if (
    embedded.status === 'validating' ||
    (embedded.status === 'allowed' && !embedded.handshakeDone)
  ) {
    return <LoadingPage />;
  }

  if (embedded.status === 'rejected') {
    return (
      <Message title="Integration not allowed">
        <p>This site is not allowed to embed the Club Med payment.</p>
      </Message>
    );
  }

  if (authError) {
    return (
      <Message title="Sign in required">
        <button
          type="button"
          className="underline font-semibold"
          onClick={() => auth.signinPopup({ state: { return_url: window.location.href } })}
        >
          Sign in
        </button>
      </Message>
    );
  }

  return children;
}
