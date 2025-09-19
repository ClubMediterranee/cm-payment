let fetchOptions = {
  apiKey: "",
  getAccessToken: () => "",
  locale: "fr-FR",
};

export const setFetchOptions = (options: {
  apiKey?: string;
  getAccessToken?: () => string;
  locale?: string;
}) => {
  fetchOptions = {
    ...fetchOptions,
    ...options,
  };
};

export const fetcher = async <T>(
  {
    url,
    method,
    params = {},
    headers,
    data,
  }: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    data?: unknown;
  },
  auth?: { withAuth: boolean }
): Promise<T> => {
  const withAuth = auth?.withAuth || false;
  const accessToken = fetchOptions.getAccessToken?.();
  const { apiKey, locale } = fetchOptions;

  if (withAuth && !accessToken) {
    throw new Error("No access token provided");
  }

  params.api_key = apiKey;
  const pathParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      pathParams.append(key, value === null ? "null" : value.toString());
    }
  });

  console.log(url, {
    method,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      ...(withAuth && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...(data ? { body: JSON.stringify(data) } : {}),
      "accept-language": locale,
      ...headers,
    },
  });

  const response = await fetch(
    `${import.meta.env.VITE_API_ENDPOINT}${url}${`?${pathParams.toString()}`}`,
    {
      method,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(withAuth && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        "accept-language": locale,
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors[0].error_description);
  }

  return json;
};
