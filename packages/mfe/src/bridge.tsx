import { CAPS_PROTOCOL_VERSION } from '@clubmed/caps';
import { createBridgeComponent } from '@module-federation/bridge-react/v19';

import { RemoteCapsForm } from './RemoteCapsForm';

/**
 * Exposed module `caps/CapsForm`: the CAPS form rendered with the remote's own React 19 root, inside the DOM
 * node provided by the host (`createRemoteAppComponent` in `@clubmed/caps/webcomponent`). Nothing is shared
 * with the host, so any React version supported by the wrapper can embed it.
 */
export default createBridgeComponent({ rootComponent: RemoteCapsForm });

/**
 * Checked by the wrapper before rendering: a different major version is refused.
 */
export const protocolVersion = CAPS_PROTOCOL_VERSION;
