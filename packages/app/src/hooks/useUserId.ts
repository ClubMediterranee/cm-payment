import Cookies from 'js-cookie';
import { useAuth } from 'react-oidc-context';
import { useSearch } from 'wouter';

/**
 * Not needed, the page won't have access to the B2C/B2C cookies
 * Also, neolane_id is not the appropriate name. Use customer_id instead.
 */
export const useUserId = () => {
  const { user } = useAuth();

  const search = useSearch();
  const neolaneId =
    Cookies.get('neolane_id') || new URLSearchParams(search).get('neolane_id') || '';
  return user?.profile.type ? neolaneId : user?.profile.sub || '';
};
