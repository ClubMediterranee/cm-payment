import { Button } from '@clubmed/trident-ui/ui/buttons/Button';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { InfoPopin } from './InfoPopin';

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const OverpaymentConfirmationPopin = ({ isOpen, onConfirm, onCancel }: Props) => {
  const { content } = useCapsConfigContext();
  const { title, description, confirm, cancel } = content.freeDeposit.overpaymentConfirmation;

  return (
    <InfoPopin
      isVisible={isOpen}
      onClose={onCancel}
      closeLabel={cancel}
      title={title}
      footer={
        <div className="flex justify-center gap-12">
          <Button onClick={onCancel} size="medium" theme="outline" color="black">
            {cancel}
          </Button>
          <Button onClick={onConfirm} size="medium">
            {confirm}
          </Button>
        </div>
      }
    >
      <p className="text-darkGrey">{description}</p>
    </InfoPopin>
  );
};
