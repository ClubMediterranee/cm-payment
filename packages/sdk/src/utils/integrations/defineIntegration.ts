const container = new Map<string, DefineIntegrationOpts>();

export type DefineIntegrationOpts<Points extends Record<string, string> = Record<string, string>> =
  {
    id: string;
    /**
     * Ids of the elements where the PSP SDK mounts its UI (hosted fields, buttons, widgets). The PSPs look
     * them up from the global `document`: inside a shadow root they are rendered in the light DOM of the
     * shadow host (see `usePspMountPoint`).
     */
    mountPoints: Points;
  };

/**
 * Declare a PSP integration and register it.
 */
export function defineIntegration<Points extends Record<string, string> = Record<string, string>>(
  opts: DefineIntegrationOpts<Points>,
): DefineIntegrationOpts<Points> {
  container.set(opts.id, opts);
  return opts;
}

export function getIntegrationConfig(id: string) {
  return container.get(id);
}

export function getIntegrations(): DefineIntegrationOpts[] {
  return [...container.values()];
}
