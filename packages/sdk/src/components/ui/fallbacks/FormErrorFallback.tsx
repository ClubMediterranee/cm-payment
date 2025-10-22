export const FormErrorFallback = ({ error }: { error: Error }) => {
  console.error(error);
  return (
    <div className="p-40 text-center">
      <h2 className="text-20 font-bold text-red-600 mb-16">Impossible d'afficher le formulaire</h2>
      <p className="text-14 text-gray-600">
        Une erreur est survenue, veuillez réessayer plus tard.
      </p>
    </div>
  );
};
