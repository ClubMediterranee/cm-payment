const STORAGE_KEY = 'caps.embedded';

export type EmbeddedParams = {
  /**
   * Origin of the host page, `null` when missing or invalid.
   */
  parentOrigin: string | null;
};

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access to `window.top` throws: we are framed.
    return true;
  }
};

export function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.pathname === '/' && !url.search && !url.hash ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * Embedded mode (`?embedded=1&parent_origin=…`), kept in the session storage of the frame so that it
 * survives internal navigations and the OIDC round trip.
 */
export function readEmbeddedParams(search: string = window.location.search): EmbeddedParams | null {
  if (!isInIframe()) {
    return null;
  }

  const params = new URLSearchParams(search);

  if (params.get('embedded') === '1') {
    const embedded = { parentOrigin: normalizeOrigin(params.get('parent_origin')) };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(embedded));

    return embedded;
  }

  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');

    return stored ? { parentOrigin: normalizeOrigin(stored.parentOrigin) } : null;
  } catch {
    return null;
  }
}

/**
 * Customer of a GM flow authenticated by the host: the `sub` claim of its access token.
 */
export function getTokenSubject(accessToken?: string): string | undefined {
  try {
    const [, payload] = (accessToken || '').split('.');

    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).sub;
  } catch {
    return undefined;
  }
}
