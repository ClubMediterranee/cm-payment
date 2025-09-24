import {lazy, Suspense} from "react";

const Loader = lazy(async () => ({
  default: (await import("@clubmed/trident-ui/molecules/Loader")).Loader,
}));

export function SigninRedirectPage() {
  return <Suspense fallback={null}>
    <Loader
      isVisible
      label="This is like elevator music but for your eyes. Please wait while we load your content."
    />
  </Suspense>
}