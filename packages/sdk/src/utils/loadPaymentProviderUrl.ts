import type { RefObject } from 'react';

import type { ProviderParametersModel } from '../__generated__/index.schemas';

const createHiddenInput = (name: string, value: string): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};

const createPostForm = (url: string, fields: Record<string, string>): HTMLFormElement => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    form.appendChild(createHiddenInput(name, value));
  });

  return form;
};

const handleGetRedirect = (url: string, iframe?: HTMLIFrameElement): void => {
  if (iframe) {
    iframe.src = url;
    return;
  }

  window.location.href = url;
};

const handlePostRedirect = (
  url: string,
  body: string | undefined,
  iframe?: HTMLIFrameElement,
): void => {
  if (!body) {
    throw new Error('POST redirect requires a body');
  }

  const fields = Object.fromEntries(new URLSearchParams(body).entries());
  const form = createPostForm(url, fields);
  const targetDocument = iframe?.contentDocument ?? iframe?.contentWindow?.document ?? document;

  targetDocument.body.appendChild(form);
  form.submit();
};

export const loadPaymentProviderUrl = (
  { url, method, body }: ProviderParametersModel,
  targetIframe?: RefObject<HTMLIFrameElement>,
): void => {
  const iframe = targetIframe?.current;
  const normalizedMethod = method.toUpperCase();

  const handlers: Record<string, () => void> = {
    GET: () => handleGetRedirect(url, iframe),
    POST: () => handlePostRedirect(url, body, iframe),
  };

  const handler = handlers[normalizedMethod];

  if (!handler) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  handler();
};
