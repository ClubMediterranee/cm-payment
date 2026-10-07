import type { RefObject } from 'react';

import type { ProviderParametersModel } from '../__generated__/index.schemas';
import { navigate, submitPostForm } from './navigate';

const handleGetRedirect = (
  url: string,
  body: string | undefined,
  iframe?: HTMLIFrameElement | null,
): void => {
  let finalUrl = url;

  if (body) {
    finalUrl = `${url}?${body}`;
  }

  if (iframe) {
    iframe.src = finalUrl;
    return;
  }

  navigate({ url: finalUrl });
};

const handlePostRedirect = (
  url: string,
  body: string | undefined,
  iframe?: HTMLIFrameElement | null,
): void => {
  if (!body) {
    throw new Error('POST redirect requires a body');
  }

  const fields = Object.fromEntries(new URLSearchParams(body).entries());
  const targetDocument = iframe?.contentDocument ?? iframe?.contentWindow?.document;

  if (targetDocument) {
    submitPostForm(url, fields, targetDocument);
    return;
  }

  navigate({ url, method: 'POST', fields });
};

export const loadPaymentProviderUrl = (
  { url, method, body }: ProviderParametersModel,
  targetIframe?: RefObject<HTMLIFrameElement | null>,
): void => {
  const iframe = targetIframe?.current;
  const normalizedMethod = method.toUpperCase();

  const handlers: Record<
    string,
    (url: string, body: string | undefined, iframe?: HTMLIFrameElement | null) => void
  > = {
    GET: handleGetRedirect,
    POST: handlePostRedirect,
  };

  const handler = handlers[normalizedMethod];

  if (!handler) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  handler(url, body, iframe);
};
