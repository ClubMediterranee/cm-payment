import { useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';

export function FlowErrorFallback({
  error,
  resetErrorBoundary,
  onError,
}: FallbackProps & { onError?: (error: Error) => void }) {
  const message = error instanceof Error ? error.message : String(error);

  useEffect(() => {
    onError?.(error instanceof Error ? error : new Error(message));
  }, [error]);

  return (
    <div className="p-40 text-center" role="alert">
      <h2 className="text-20 font-bold text-red mb-16">Impossible d'afficher le formulaire</h2>
      <p className="text-14 text-middleGrey mb-16">{message}</p>
      <button type="button" className="underline font-semibold" onClick={resetErrorBoundary}>
        Réessayer
      </button>
    </div>
  );
}
