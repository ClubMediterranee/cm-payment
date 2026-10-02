import {
  CapsMessageType,
  type CapsMessagePayloads,
  createCapsMessage,
  isCapsMessage,
  type NavigationRequest,
} from '@clubmed/caps';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { readEmbeddedParams } from './embeddedParams';

/**
 * Time left to the host to send its access token before the frame starts its own OIDC sign-in.
 */
export const HANDSHAKE_TIMEOUT_MS = 800;

type OutgoingType = Exclude<
  CapsMessageType,
  typeof CapsMessageType.INIT | typeof CapsMessageType.PAYMENT_REDIRECT_LOADING
>;

export type EmbeddedPost = <T extends OutgoingType>(
  type: T,
  payload?: CapsMessagePayloads[T],
) => void;

export type EmbeddedState =
  | { active: false }
  | {
      active: true;
      /**
       * `validating` until the parent origin is checked against the CAPS allow-list.
       */
      status: 'validating' | 'allowed' | 'rejected';
      parentOrigin: string | null;
      /**
       * `true` once the host answered the handshake or the handshake timed out.
       */
      handshakeDone: boolean;
      hostToken?: string;
      content?: Record<string, unknown>;
      post: EmbeddedPost;
      navigate: (request: NavigationRequest) => void;
    };

const EmbeddedContext = createContext<EmbeddedState>({ active: false });

export const useEmbedded = () => useContext(EmbeddedContext);

const noopPost: EmbeddedPost = () => {};

/**
 * Post a CAPS message to the host page; a no-op outside the embedded mode.
 */
export function usePostToHost(): EmbeddedPost {
  const embedded = useEmbedded();

  return embedded.active ? embedded.post : noopPost;
}

const getFlowFromPath = (pathname: string) => {
  const [issuer = 'gm', type] = pathname.split('/').filter(Boolean);

  return { issuer: issuer.toUpperCase(), type: type === 'proposal' ? 'proposal' : 'booking' };
};

async function isParentAllowed(parentOrigin: string | null): Promise<boolean> {
  if (!parentOrigin) {
    return false;
  }

  const { issuer, type } = getFlowFromPath(window.location.pathname);
  const response = await fetch(`/rest/embed/config?issuer=${issuer}&type=${type}`);

  if (!response.ok) {
    return false;
  }

  const { allowedOrigins } = await response.json();

  return (allowedOrigins?.iframe || []).includes(parentOrigin);
}

export function EmbeddedProvider({ children }: PropsWithChildren) {
  const params = useMemo(() => readEmbeddedParams(), []);
  const [status, setStatus] = useState<'validating' | 'allowed' | 'rejected'>('validating');
  const [handshakeDone, setHandshakeDone] = useState(false);
  const [init, setInit] = useState<CapsMessagePayloads[typeof CapsMessageType.INIT]>({});

  const parentOrigin = params?.parentOrigin ?? null;
  const isAllowed = status === 'allowed';

  const post = useCallback(
    <T extends OutgoingType>(type: T, payload?: CapsMessagePayloads[T]) => {
      if (isAllowed && parentOrigin) {
        window.parent.postMessage(
          createCapsMessage(type, ...([payload] as [CapsMessagePayloads[T]])),
          parentOrigin,
        );
      }
    },
    [isAllowed, parentOrigin],
  );

  useEffect(() => {
    if (!params) {
      return;
    }

    document.documentElement.classList.add('caps-embedded');

    isParentAllowed(parentOrigin)
      .then((allowed) => setStatus(allowed ? 'allowed' : 'rejected'))
      .catch(() => setStatus('rejected'));
  }, [params, parentOrigin]);

  // Handshake: announce the frame, then wait for the host token (or time out and let the frame sign in).
  useEffect(() => {
    if (!isAllowed) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (
        event.source === window.parent &&
        event.origin === parentOrigin &&
        isCapsMessage(event.data) &&
        event.data.type === CapsMessageType.INIT
      ) {
        const { accessToken, content } = event.data;

        setInit({ accessToken, content });
        setHandshakeDone(true);
      }
    };

    window.addEventListener('message', onMessage);
    post(CapsMessageType.READY);

    const timeout = window.setTimeout(() => setHandshakeDone(true), HANDSHAKE_TIMEOUT_MS);

    return () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timeout);
    };
  }, [isAllowed, parentOrigin, post]);

  // Auto-resize: the host sizes the iframe to the document height.
  useEffect(() => {
    if (!isAllowed || typeof ResizeObserver === 'undefined') {
      return;
    }

    let lastHeight = -1;
    const observer = new ResizeObserver(() => {
      // The html element is sized by its content (the frame viewport is not a minimum).
      const height = Math.ceil(document.documentElement.getBoundingClientRect().height);

      if (height !== lastHeight) {
        lastHeight = height;
        post(CapsMessageType.RESIZE, { height });
      }
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  }, [isAllowed, post]);

  const value = useMemo<EmbeddedState>(() => {
    if (!params) {
      return { active: false };
    }

    return {
      active: true,
      status,
      parentOrigin,
      handshakeDone,
      hostToken: init.accessToken,
      content: init.content,
      post,
      // Top-level navigations (PSP, confirmation) are performed by the host window.
      navigate: ({ url, method, fields }) =>
        post(CapsMessageType.PAYMENT_REDIRECT, { url, method, fields }),
    };
  }, [params, status, parentOrigin, handshakeDone, init, post]);

  return <EmbeddedContext.Provider value={value}>{children}</EmbeddedContext.Provider>;
}
