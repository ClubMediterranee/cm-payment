import type {OidcIssuerTypes} from "@clubmed/payment-sdk/types/SDKOptions.js";
import React, {isValidElement} from "react";
import {GLOBAL_SDK_SETTINGS} from "@clubmed/payment-sdk/config.js";

function getAvailableComponent(children: React.ReactNode): symbol[] {
  function flattenChildren(children: React.ReactNode): React.ReactNode[] {
    return React.Children.toArray(children).flatMap((child) => {
      if (isValidElement(child) && child.props?.children) {
        return [child, ...flattenChildren(child.props.children)];
      }
      return child;
    })
  }

  return flattenChildren(children).map((child) => {
    return (child as { type: { COMPONENT_KEY?: symbol } })?.type?.COMPONENT_KEY
  }).filter(Boolean) as symbol[]
}


export function validateComponents(issuer: OidcIssuerTypes, children: React.ReactNode) {
  const symbols = getAvailableComponent(children)
  const requiredSymbols = GLOBAL_SDK_SETTINGS.components[issuer]

  if (!requiredSymbols) {
    throw new Error(`No components defined for issuer type: ${issuer}`)
  }

  if (requiredSymbols.every((token) => symbols.includes(token))) {
    throw new Error(`Missing required components: ${requiredSymbols.filter((key) => !symbols.includes(key)).map((key) => key.description).join(', ')}`)
  }
}