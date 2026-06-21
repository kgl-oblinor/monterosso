// Thin typed fetch wrapper around the backend Worker. All backend access goes through
// here. It reads the auth token lazily (set by the auth store) so requests carry a
// `Authorization: Bearer <jwt>` header once the user is signed in.
import { env } from "./env";

let authToken: string | null = null;

/** Called by the auth store whenever the token changes (login / logout / rehydrate). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable request body. */
  json?: unknown;
  /** Skip the Authorization header even if a token is present. */
  anonymous?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, anonymous, headers, ...rest } = options;
  const url = `${env.apiBase}${path}`;

  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (!anonymous && authToken) {
    finalHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  // Parse a body if there is one; tolerate empty 2xx responses.
  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : res.statusText) || `Noe gikk galt (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", json }),
};
