import type { FallbackProps } from 'react-error-boundary';

export const FormErrorFallback = ({ error }: FallbackProps) => {
  console.error(error);
  return (
    <div className="p-40 text-center">
      <h2 className="text-b2 font-semibold text-red mb-16">Impossible d'afficher le formulaire</h2>
      <p className="text-b4 text-darkGrey">
        Une erreur est survenue, veuillez réessayer plus tard.
      </p>
    </div>
  );
};
