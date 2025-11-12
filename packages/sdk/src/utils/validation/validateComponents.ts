import { GLOBAL_CAPS_SETTINGS } from '@clubmed/payment-sdk/config.js';
import type { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings.js';
import React, { isValidElement } from 'react';

function getAvailableComponent(children: React.ReactNode): symbol[] {
  function flattenChildren(children: React.ReactNode): React.ReactNode[] {
    return React.Children.toArray(children).flatMap((child) => {
      if (isValidElement(child)) {
        const props = child.props as Record<string, unknown>;
        if (props.children) {
          return [child, ...flattenChildren(props.children as React.ReactNode)];
        }
      }
      return child;
    });
  }

  return flattenChildren(children)
    .map((child) => {
      if (isValidElement(child)) {
        const elementType = child.type as { COMPONENT_KEY?: symbol };
        return elementType?.COMPONENT_KEY;
      }
      return undefined;
    })
    .filter((key): key is symbol => Boolean(key));
}

export function validateComponents(issuer: OidcIssuerTypes, children: React.ReactNode) {
  const symbols = getAvailableComponent(children);

  const requiredSymbols = GLOBAL_CAPS_SETTINGS.components[issuer];

  if (!requiredSymbols) {
    throw new Error(`No components defined for issuer type: ${issuer}`);
  }

  if (!requiredSymbols.every((token) => symbols.includes(token))) {
    throw new Error(
      `Missing required components: ${requiredSymbols
        .filter((key) => !symbols.includes(key))
        .map((key) => key.description)
        .join(', ')}`,
    );
  }
}
