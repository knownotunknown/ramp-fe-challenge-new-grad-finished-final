import { useCallback, useContext } from "react";
import { AppContext } from "../utils/context";
import { fakeFetch, RegisteredEndpoints } from "../utils/fetch";
import { useWrappedRequest } from "./useWrappedRequest";

export function useCustomFetch() {
  const { cache } = useContext(AppContext);
  const { loading, wrappedRequest } = useWrappedRequest();

  const fetchWithCache = useCallback(
    async <TData, TParams extends object = object>(
      endpoint: RegisteredEndpoints,
      params?: TParams
    ): Promise<TData | null> =>
      wrappedRequest<TData>(async () => {
        const cacheKey = getCacheKey(endpoint, params);
        const cacheResponse = cache?.current.get(cacheKey);

        if (cacheResponse) {
          const data = JSON.parse(cacheResponse);
          return data as Promise<TData>;
        }

        const result = await fakeFetch<TData>(endpoint, params);
        cache?.current.set(cacheKey, JSON.stringify(result));
        return result;
      }),
    [cache, wrappedRequest]
  );

  const fetchWithoutCache = useCallback(
    async <TData, TParams extends object = object>(
      endpoint: RegisteredEndpoints,
      params?: TParams
    ): Promise<TData | null> =>
      wrappedRequest<TData>(async () => {
        const result = await fakeFetch<TData>(endpoint, params);
        return result;
      }),
    [wrappedRequest]
  );

  const clearCache = useCallback(() => {
    if (cache?.current === undefined) {
      return;
    }

    cache.current = new Map<string, string>();
  }, [cache]);

  const clearCacheByEndpoint = useCallback(
    (endpointsToClear: RegisteredEndpoints[]) => {
      if (cache?.current === undefined) {
        return;
      }

      const cacheKeys = Array.from(cache.current.keys());

      for (const key of cacheKeys) {
        const clearKey = endpointsToClear.some((endpoint) =>
          key.startsWith(endpoint)
        );

        if (clearKey) {
          cache.current.delete(key);
        }
      }
    },
    [cache]
  );

  const updateCacheByEndpoint = useCallback(
    <TData>(
      endpoints: RegisteredEndpoints[],
      updateFn: (data: TData) => TData
    ) => {
      if (cache?.current === undefined) {
        return;
      }

      const cacheKeys = Array.from(cache.current.keys());

      for (const key of cacheKeys) {
        const shouldUpdate = endpoints.some((endpoint) =>
          key.startsWith(endpoint)
        );

        if (shouldUpdate) {
          const cacheResponse = cache.current.get(key);
          if (cacheResponse) {
            try {
              const currentData = JSON.parse(cacheResponse);
              const updatedData = updateFn(currentData);
              cache.current.set(key, JSON.stringify(updatedData));
            } catch (e) {
              console.error(`Failed to update cache for ${key}:`, e);
            }
          }
        }
      }
    },
    [cache]
  );

  return {
    fetchWithCache,
    fetchWithoutCache,
    clearCache,
    clearCacheByEndpoint,
    updateCacheByEndpoint,
    loading,
  };
}

function getCacheKey(endpoint: RegisteredEndpoints, params?: object) {
  return `${endpoint}${params ? `@${JSON.stringify(params)}` : ""}`;
}
