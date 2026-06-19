import { Button } from '@clubmed/trident-ui/molecules/Buttons/v2/Button';
import { type ReactNode } from 'react';

interface PopinProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Popin = ({ isVisible, onClose, children }: PopinProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-20">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      />
      <div className="relative z-10 sm:w-360 flex gap-6 flex-col items-end">
        <Button
          color="white"
          variant="circle"
          icon="CrossDefault"
          aria-label="Close"
          onClick={onClose}
        />
        <div className="bg-white rounded-16 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
