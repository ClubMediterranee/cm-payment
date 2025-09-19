import { useAuth } from "react-oidc-context";
import Cookies from "js-cookie";
import { useSearch } from "wouter";

export const useUserId = () => {
  const { user } = useAuth();

  const search = useSearch();
  const neolaneId =
    Cookies.get("neolane_id") ||
    new URLSearchParams(search).get("neolane_id") ||
    "";
  return user?.profile.type ? neolaneId : user?.profile.sub || "";
};
