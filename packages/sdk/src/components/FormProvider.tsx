import React, {  isValidElement, PropsWithChildren } from "react";
import { FormProvider as ReactHookFormProvider, useForm } from "react-hook-form";
import { Form } from "./Form";
import { AppProvider, AppProviderProps } from "../providers/AppProvider";
import {  Form_Pattern } from "../utils/constants";


const getAvailableComponent = (children: React.ReactNode) => {
  function flattenChildren(children: React.ReactNode): React.ReactNode[] {
    const flattedChildren = React.Children.toArray(children).flatMap((child) => {
      if (isValidElement(child) && child.props?.children) {
        return [child, ...flattenChildren(child.props.children)];
      }
      return child;
    })
    return flattedChildren
  }
  return flattenChildren(children).map((child) => {
    return (child as { type: { COMPONENT_KEY?: symbol } })?.type?.COMPONENT_KEY
  }).filter(Boolean)
}


/*
 * Form children must contains required components, refer to Form_Pattern constant
*/
export function FormProvider({ children, ...props }: PropsWithChildren<AppProviderProps>) {
  const methods = useForm();

  const formPattern = Form_Pattern[props.issuer as keyof typeof Form_Pattern]
  const availableComponents = getAvailableComponent(children)

  if (!formPattern.every((key) => availableComponents.includes(key))){
    throw new Error(`Missing required components: ${formPattern.filter((key) => !availableComponents.includes(key)).map((key) => key.description).join(', ')}`)
  }

  return (
     <AppProvider {...props}>
      <ReactHookFormProvider {...methods}>
        <Form>
          {children}
        </Form>
      </ReactHookFormProvider>
    </AppProvider>
  );
}
