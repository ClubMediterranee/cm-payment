import type { RefObject } from 'react';

import type { ProviderParametersModel } from '../__generated__/index.schemas';

const buildUrlWithParams = (url: string, body?: string): string => {
  if (!body) return url;

  const urlObj = new URL(url);
  const params = new URLSearchParams(body);
  params.forEach((value, key) => urlObj.searchParams.set(key, value));
  return urlObj.toString();
};

const submitPostForm = (url: string, body: string, targetDocument: Document): void => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  new URLSearchParams(body).forEach((value, name) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  targetDocument.body.appendChild(form);
  form.submit();
};

export const loadPaymentProviderUrl = (
  { url, method, body }: ProviderParametersModel,
  targetIframe?: RefObject<HTMLIFrameElement>,
): void => {
  const iframe = targetIframe?.current;
  const targetDocument = iframe?.contentDocument ?? iframe?.contentWindow?.document ?? document;

  if (method.toUpperCase() === 'POST') {
    if (!body) throw new Error('POST redirect requires a body');
    submitPostForm(url, body, targetDocument);
    return;
  }

  const finalUrl = buildUrlWithParams(url, body);

  if (iframe) {
    iframe.src = finalUrl;
  } else {
    window.location.href = finalUrl;
  }
};
