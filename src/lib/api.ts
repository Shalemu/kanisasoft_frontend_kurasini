// lib/api.ts
import { clearSession } from "./session";

export interface ApiOptions extends RequestInit {
  body?: any; // allow object for JSON payloads
  throwOnError?: boolean;
}

export class ApiAuthError extends Error {
  constructor(message = "Unauthenticated.") {
    super(message);
    this.name = "ApiAuthError";
  }
}

const GET_CACHE_TTL_MS = 10_000;
const getRequestCache = new Map<
  string,
  {
    expiresAt: number;
    data?: any;
    promise?: Promise<any>;
  }
>();

function isAuthError(response: Response, data: any) {
  const message = String(data?.message || "").toLowerCase();

  return (
    [401, 403, 419].includes(response.status) ||
    message.includes("unauthenticated") ||
    message.includes("unauthorized")
  );
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) throw new Error('API base URL is not defined!');

  const { throwOnError = true, ...requestOptions } = options;
 
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const customHeaders: Record<string, string> = {};

  if (requestOptions.headers instanceof Headers) {
    requestOptions.headers.forEach((value, key) => {
      customHeaders[key] = value;
    });
  } else if (Array.isArray(requestOptions.headers)) {
    requestOptions.headers.forEach(([key, value]) => {
      customHeaders[key] = value;
    });
  } else if (requestOptions.headers) {
    Object.assign(customHeaders, requestOptions.headers);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const body =
    requestOptions.body && typeof requestOptions.body !== "string"
      ? JSON.stringify(requestOptions.body)
      : requestOptions.body;

  const method = (requestOptions.method ?? "GET").toUpperCase();
  const canUseGetCache = method === "GET" && !body && !requestOptions.signal;
  const cacheKey = `${token ?? "guest"}:${endpoint}`;
  const cached = canUseGetCache ? getRequestCache.get(cacheKey) : undefined;

  if (cached?.promise) {
    return cached.promise;
  }

  if (cached?.data !== undefined && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const requestPromise = (async () => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...requestOptions,
      headers,
      body,
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const data = isJson ? await response.json() : {};

    if (!response.ok) {
      if (!throwOnError) {
        return {
          ...data,
          ok: false,
          status: response.status,
        };
      }

      if (isAuthError(response, data)) {
        clearSession();

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.replace("/login");
        }

        throw new ApiAuthError(data?.message || "Unauthenticated.");
      }

      throw new Error(
        data?.message || `Request failed with status ${response.status}`
      );
    }

    return data;
  })();

  if (canUseGetCache) {
    getRequestCache.set(cacheKey, {
      expiresAt: Date.now() + GET_CACHE_TTL_MS,
      promise: requestPromise,
    });
  }

  try {
    const data = await requestPromise;

    if (canUseGetCache) {
      getRequestCache.set(cacheKey, {
        expiresAt: Date.now() + GET_CACHE_TTL_MS,
        data,
      });
    }

    return data;
  } catch (error) {
    if (canUseGetCache) {
      getRequestCache.delete(cacheKey);
    }

    throw error;
  }
}
