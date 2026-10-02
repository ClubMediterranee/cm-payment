'use client';

import { type IframeHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';

import { resolveCapsUrl } from '../shared/env';
import {
  type CapsMessage,
  CapsMessageType,
  type CapsRedirectPayload,
  createCapsMessage,
  isCapsMessage,
  isCompatibleProtocolVersion,
} from '../shared/protocol';
import type { CapsFormProps } from '../shared/types';
import { buildCapsFlowUrl } from '../shared/url';

export type CapsFormIFrameProps = CapsFormProps & {
  /**
   * Fixed iframe height. Disables the auto-resize.
   */
  height?: number | string;
  title?: string;
  /**
   * Extra attributes of the `<iframe>` element (`loading`, `referrerPolicy`…).
   */
  iframeProps?: Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'src' | 'title' | 'allow' | 'style'>;
};

const DEFAULT_HEIGHT = 600;

function submitTopLevelForm(url: string, fields: Record<string, string> = {}) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.target = '_top';
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function navigateTop({ url, method, fields }: CapsRedirectPayload) {
  if (method === 'POST') {
    submitTopLevelForm(url, fields);
    return;
  }

  window.location.assign(url);
}

/**
 * Embed the CAPS payment flow in an iframe, served by the CAPS server of the selected environment.
 * Works with any React version and needs no styling on the host side.
 */
export function CapsFormIFrame(props: CapsFormIFrameProps) {
  const {
    env,
    url,
    height,
    title = 'Club Med payment',
    iframeProps,
    className,
    style,
    fallback = null,
    accessToken,
    content,
  } = props;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string>();
  const [autoHeight, setAutoHeight] = useState<number>();
  // Incremented on every CAPS_READY: a reloaded frame announces itself again and must receive the token again.
  const [readyCount, setReadyCount] = useState(0);
  const callbacks = useRef(props);
  callbacks.current = props;

  const capsUrl = useMemo(() => {
    try {
      return resolveCapsUrl({ env, url });
    } catch {
      return undefined;
    }
  }, [env, url]);

  const capsOrigin = capsUrl ? new URL(capsUrl).origin : undefined;

  const flowUrlKey = JSON.stringify([
    props.issuerType,
    props.type,
    props.id,
    props.customerId,
    props.locale,
    props.callbackUrl,
    props.callbackUrlSeller,
    props.action,
    props.reference,
    props.uuid,
  ]);

  // Built on the client only: the parent origin is part of the URL (SSR renders the fallback).
  useEffect(() => {
    if (!capsUrl) {
      callbacks.current.onError?.({
        code: 'REMOTE_LOAD_FAILED',
        message: `[CAPS] Unknown environment "${env}"`,
      });
      return;
    }

    try {
      setReadyCount(0);
      setSrc(
        buildCapsFlowUrl(capsUrl, callbacks.current, {
          embedded: '1',
          parent_origin: window.location.origin,
        }),
      );
    } catch (error) {
      callbacks.current.onError?.({ code: 'FLOW_ERROR', message: (error as Error).message });
    }
  }, [capsUrl, flowUrlKey]);

  // The host token is never put in the URL: it is sent once the frame is ready, and on every change.
  useEffect(() => {
    if (readyCount > 0 && capsOrigin) {
      iframeRef.current?.contentWindow?.postMessage(
        createCapsMessage(CapsMessageType.INIT, { accessToken, content }),
        capsOrigin,
      );
    }
    // `content` is compared by value: hosts often pass inline objects.
  }, [readyCount, capsOrigin, accessToken, JSON.stringify(content ?? null)]);

  useEffect(() => {
    if (!capsOrigin) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== capsOrigin ||
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow ||
        !isCapsMessage(event.data) ||
        !isCompatibleProtocolVersion(event.data.version)
      ) {
        return;
      }

      const message = event.data as CapsMessage;
      const { onReady, onLoadingChange, onError, onRedirect } = callbacks.current;

      switch (message.type) {
        case CapsMessageType.READY:
          setReadyCount((count) => count + 1);
          onReady?.();
          break;
        case CapsMessageType.RESIZE:
          setAutoHeight(message.height);
          break;
        case CapsMessageType.LOADING:
          onLoadingChange?.(message.loading);
          break;
        case CapsMessageType.ERROR:
          onError?.({ code: message.code, message: message.message });
          break;
        case CapsMessageType.PAYMENT_REDIRECT:
          if (onRedirect?.(message.url) !== false) {
            navigateTop(message);
          }
          break;
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [capsOrigin]);

  if (!src) {
    return <>{fallback}</>;
  }

  return (
    <iframe
      {...iframeProps}
      ref={iframeRef}
      src={src}
      title={title}
      allow="payment"
      className={className}
      style={{
        border: 0,
        width: '100%',
        display: 'block',
        ...style,
        height: height ?? autoHeight ?? DEFAULT_HEIGHT,
      }}
    />
  );
}
