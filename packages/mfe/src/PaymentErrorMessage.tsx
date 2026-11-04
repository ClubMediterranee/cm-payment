import { useEffect, useRef } from 'react';

export function PaymentErrorMessage({ message }: { message?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message) {
      ref.current?.scrollIntoView({ block: 'center' });
    }
  }, [message]);

  return message ? (
    <p ref={ref} className="text-red font-semibold my-4 text-center">
      {message}
    </p>
  ) : null;
}
