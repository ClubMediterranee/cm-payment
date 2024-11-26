import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Action } from "../api";

const paramsSchema = z.object({
  id: z.number(),
  type: z.enum(["proposal", "booking"]),
});

type AppContextType = {
  isIframe: boolean;
  id: string;
  type: string;
  action: Action;
  locale: string;
  setAction: Dispatch<SetStateAction<Action>>;
};

export const AppContext = createContext<AppContextType>({
  isIframe: false,
  id: "",
  type: "",
  action: Action.PAYMENT_RESA as Action,
  locale: "fr-FR",
  setAction: () => {},
});

export const AppProvider = ({ children }: PropsWithChildren) => {
  const isIframe = window.top !== window.self;
  const { id = "", type = "", locale = "fr-FR" } = useParams();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const [action, setAction] = useState(Action.PAYMENT_RESA as Action);

  if (type === "booking" && !auth.isAuthenticated) {
    return null;
  }

  if (!paramsSchema.safeParse({ id: Number(id), type }).success) {
    setLocation("/404");
  }

  return (
    <AppContext.Provider
      value={{ isIframe, id, type, locale, action, setAction }}
    >
      {children}
    </AppContext.Provider>
  );
};
