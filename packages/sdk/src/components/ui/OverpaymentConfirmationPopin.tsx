import { Button } from '@clubmed/trident-ui/molecules/Buttons/Button';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { Popin } from './Popin';

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const OverpaymentConfirmationPopin = ({ isOpen, onConfirm, onCancel }: Props) => {
  const { content } = useCapsConfigContext();
  const { title, description, confirm, cancel } = content.freeDeposit.overpaymentConfirmation;

  return (
    <Popin isVisible={isOpen} onClose={onCancel}>
      <div className="p-20 flex flex-col gap-20">
        <div className="flex flex-col gap-10">
          <h3 className="text-b2 font-serif">{title}</h3>
          <p className="text-b5 text-grey-dark">{description}</p>
        </div>
        <div className="flex justify-end gap-10">
          <Button onClick={onCancel} size="medium" theme="outline">
            {cancel}
          </Button>
          <Button onClick={onConfirm} size="medium">
            {confirm}
          </Button>
        </div>
      </div>
    </Popin>
  );
};
