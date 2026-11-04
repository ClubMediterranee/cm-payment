import { getPaymentConfig } from '../providers/PaymentConfigProvider';

export type NavigationRequest = {
  url: string;
  /**
   * `POST` navigations are submitted as a hidden form with `fields`.
   */
  method?: 'GET' | 'POST';
  fields?: Record<string, string>;
};

export type NavigationHandler = (request: NavigationRequest) => void;

const createHiddenInput = (name: string, value: string) => {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
};

export function submitPostForm(
  url: string,
  fields: Record<string, string>,
  targetDocument: Document = document,
): void {
  // Elements are created from the current document and adopted by the target one (PSP iframe).
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    form.appendChild(createHiddenInput(name, value));
  });

  targetDocument.body.appendChild(form);
  form.submit();
}

export const defaultNavigate: NavigationHandler = ({ url, method = 'GET', fields = {} }) => {
  if (method === 'POST') {
    submitPostForm(url, fields);
    return;
  }

  window.location.href = url;
};

/**
 * Top-level navigation of the payment flow (PSP redirection, confirmation).
 * Delegates to `onNavigate` when the integration provides one (webcomponent embed), otherwise navigates the window.
 */
export function navigate(request: NavigationRequest): void {
  const { onNavigate } = getPaymentConfig();

  (onNavigate || defaultNavigate)(request);
}
