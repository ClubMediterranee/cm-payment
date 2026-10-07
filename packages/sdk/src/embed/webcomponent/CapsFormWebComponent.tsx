'use client';

import { createRemoteAppComponent } from '@module-federation/bridge-react/base';
import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { resolveCapsUrl } from '../shared/env';
import type { CapsEmbedError, CapsFormProps, CapsRemoteFormProps } from '../shared/types';
import { type CapsRemoteModule, loadCapsRemoteForm, toCapsEmbedError } from './loader';
import { getCapsFormSlots, getServerCapsFormSlots, subscribeCapsFormSlots } from './slots';

type LoadState = { module?: CapsRemoteModule; error?: CapsEmbedError };

/**
 * Host side of the bridge for an already loaded module (load errors are handled before, with CAPS codes).
 */
function createRemoteForm(
  module: CapsRemoteModule,
  onError: (error: CapsEmbedError) => void,
): ComponentType<CapsRemoteFormProps> {
  // Rendered by the host React when the bridge fails; the remote uses its own fallback.
  const BridgeErrorFallback = ({ error }: { error: Error }) => {
    useEffect(() => onError({ code: 'FLOW_ERROR', message: error.message }), [error]);
    return null;
  };

  return createRemoteAppComponent({
    loader: async () => module,
    loading: null,
    fallback: BridgeErrorFallback,
  }) as unknown as ComponentType<CapsRemoteFormProps>;
}

/**
 * Embed the CAPS payment form, loaded at runtime from the CAPS server of the selected environment.
 * The form renders with its own React root (`@module-federation/bridge-react`) inside a `<caps-form>` shadow
 * root: nothing is shared with the host but the DOM node, and CAPS styles never leak.
 */
export function CapsFormWebComponent(props: CapsFormProps) {
  const { env, url, fallback = null, className, style, ...formProps } = props;
  const [state, setState] = useState<LoadState>({});
  const slots = useSyncExternalStore(
    subscribeCapsFormSlots,
    getCapsFormSlots,
    getServerCapsFormSlots,
  );
  const onErrorRef = useRef(props.onError);
  onErrorRef.current = props.onError;

  let capsUrl: string | undefined;
  let resolveError: CapsEmbedError | undefined;

  try {
    capsUrl = resolveCapsUrl({ env, url });
  } catch (error) {
    resolveError = { code: 'REMOTE_LOAD_FAILED', message: (error as Error).message };
  }

  useEffect(() => {
    if (!capsUrl) {
      onErrorRef.current?.(resolveError!);
      return;
    }

    let active = true;

    setState({});

    loadCapsRemoteForm(capsUrl)
      .then((module) => active && setState({ module }))
      .catch((error: unknown) => {
        if (active) {
          const embedError = toCapsEmbedError(error);
          setState({ error: embedError });
          onErrorRef.current?.(embedError);
        }
      });

    return () => {
      active = false;
    };
  }, [capsUrl]);

  const RemoteForm = useMemo(
    () =>
      state.module
        ? createRemoteForm(state.module, (error) => onErrorRef.current?.(error))
        : undefined,
    [state.module],
  );

  if (state.error || resolveError) {
    return null;
  }

  if (!RemoteForm || !capsUrl) {
    return <>{fallback}</>;
  }

  return (
    <RemoteForm
      {...formProps}
      capsUrl={capsUrl}
      slots={slots}
      className={className}
      style={style}
    />
  );
}
