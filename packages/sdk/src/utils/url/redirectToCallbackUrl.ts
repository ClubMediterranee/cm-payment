export const redirectToCallbackUrl = ({
  callbackUrl,
  paymentResponse,
  proposalId,
}: {
  callbackUrl: string | null;
  paymentResponse: Record<string, any>;
  proposalId: string | null;
}) => {
  const params = new URLSearchParams({
    ...paymentResponse,
    ...(proposalId ? { proposal_id: proposalId } : {}),
  });

  window.location.href = `${callbackUrl}?${params.toString()}`;
};
