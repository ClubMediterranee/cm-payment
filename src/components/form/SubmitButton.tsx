import { Button } from "@clubmed/trident-ui/molecules/Buttons/Button";
import { useMessage } from "../../hooks/useMessage";
import { useAppContext } from "../../hooks/useAppContext";

export const SubmitButton = ({ onSubmit }) => {
  useMessage("submit", onSubmit);

  const { isIframe } = useAppContext();

  if (isIframe) {
    return null;
  }

  return (
    <Button type="submit" className="mt-8">
      Payer
    </Button>
  );
};
