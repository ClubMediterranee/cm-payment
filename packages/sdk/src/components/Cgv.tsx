import { useCapsConfigContext } from '../hooks/utils/useCapsConfigContext';
import { useWatch } from '../hooks/utils/useForm';
import { TOKENS } from '../types/Tokens';
import { CheckboxField } from './ui/Form/CheckboxField';
import { FormPanel } from './ui/FormPanel';
import { CheckboxSkeleton, TitleSkeleton } from './ui/skeletons';

export const Cgv = () => {
  const { content } = useCapsConfigContext();
  const donationAmount = useWatch('donation_amount');
  const hasDonation = (donationAmount || 0) > 0;

  return (
    <FormPanel className="w-full">
      <div className="flex flex-col gap-20">
        <CheckboxField name="cgv">
          <span className="text-b4 font-bold">{content.cgv.content}</span>
        </CheckboxField>

        {hasDonation && (
          <CheckboxField name="cgv_donation">
            <span className="text-b4 font-bold">
              {content.donation.acceptCGU}{' '}
              {content.donation.linkDonationTerms && (
                <a
                  href={content.donation.linkDonationTerms}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary"
                >
                  {content.donation.donationTerms}
                </a>
              )}
            </span>
          </CheckboxField>
        )}
      </div>
    </FormPanel>
  );
};

const CgvSkeleton = () => (
  <div className="w-full">
    <TitleSkeleton variant="h5" />
    <FormPanel>
      <CheckboxSkeleton />
    </FormPanel>
  </div>
);

Cgv.Skeleton = CgvSkeleton;
Cgv.COMPONENT_KEY = TOKENS.Cgv;
