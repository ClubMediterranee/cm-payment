import { SKELETON_REGISTRY } from '../../../types/SkeletonRegistry';

type Props = {
  symbols: symbol[];
};

export const GlobalFormSkeleton = ({ symbols }: Props) => {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-24">
      {symbols.map((symbol, index) => {
        const SkeletonComponent = SKELETON_REGISTRY[symbol as keyof typeof SKELETON_REGISTRY];
        return SkeletonComponent ? (
          <div className="w-full">
            <SkeletonComponent key={index} />
          </div>
        ) : null;
      })}
    </div>
  );
};
