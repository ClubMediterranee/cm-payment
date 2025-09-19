import {
  createContext,
  PropsWithChildren,
} from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useParams } from "wouter";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.number(),
  type: z.enum(["proposal", "booking"]),
});

type AppContextType = {
  isIframe: boolean;
  id: string;
  type: string;
  locale: string;
};

export const AppContext = createContext<AppContextType>({
  isIframe: false,
  id: "",
  type: "",
  locale: "fr-FR",
});

export const AppProvider = ({ children }: PropsWithChildren) => {
  const isIframe = window.top !== window.self;
  const { id = "", type = "", locale = "fr-FR" } = useParams();
  const auth = useAuth();
  const [, setLocation] = useLocation();

  if (type === "booking" && !auth.isAuthenticated) {
    return null;
  }

  if (!paramsSchema.safeParse({ id: Number(id), type }).success) {
    setLocation("/404");
  }

  return (
    <AppContext.Provider
      value={{ isIframe, id, type, locale }}
    >
      {children}
    </AppContext.Provider>
  );
};
