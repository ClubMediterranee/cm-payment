export const TitleSkeleton = ({ variant }: { variant: 'h3' | 'h5' }) => {
  const height = variant === 'h3' ? 'h-24' : 'h-20';
  return <div className={`${height} w-2/5 rounded-8 animate-pulsation bg-lightGrey mb-16`} />;
};

export const RadioSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-12 ${className}`}>
      <div className="w-20 h-20 rounded-full animate-pulsation bg-lightGrey flex-shrink-0" />
      <div className="h-12 w-full rounded-8 animate-pulsation bg-lightGrey" />
    </div>
  );
};

export const CheckboxSkeleton = () => {
  return (
    <div className="flex items-start gap-12">
      <div className="w-20 h-20 rounded-4 animate-pulsation bg-lightGrey flex-shrink-0" />
      <div className="h-12 w-full rounded-8 animate-pulsation bg-lightGrey" />
    </div>
  );
};

export const TextFieldSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="h-12 w-1/3 rounded-8 animate-pulsation bg-lightGrey px-20" />
      <div className="relative isolate rounded-pill overflow-hidden border border-lightGrey h-48 animate-pulsation bg-lightGrey" />
    </div>
  );
};
