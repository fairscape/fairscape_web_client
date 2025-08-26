import React, { useCallback, useContext } from "react";
import { API_URL } from "../config";
import { AuthContext } from "../context/AuthContext";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  credentials?: RequestCredentials; // defaults to 'same-origin' for JWT
}

function merge(a?: Record<string, string>, b?: Record<string, string>) {
  return { ...(a || {}), ...(b || {}) };
}

export function useHttp() {
  const { token } = useContext(AuthContext);

  const http = useCallback(
    async (path: string, options: HttpOptions = {}) => {
      const url = path.startsWith("http") ? path : `${API_URL}${path}`;
      const { body, headers, method = "GET", signal, credentials } = options;

      const auth: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const ct =
        body && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {};

      const resp = await fetch(url, {
        method,
        headers: merge(
          merge({ Accept: "application/json" }, auth),
          merge(ct, headers)
        ),
        body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
        signal,
        credentials: credentials ?? "same-origin",
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${text}`);
      }
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return resp.json();
      return resp.text();
    },
    [token]
  );

  return http;
}
