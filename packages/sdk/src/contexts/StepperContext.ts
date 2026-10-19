import { createContext, useContext } from 'react';

export const StepperContext = createContext(false);

export const useStepper = () => useContext(StepperContext);
