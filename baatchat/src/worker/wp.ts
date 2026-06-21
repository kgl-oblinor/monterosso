// WordPress REST client for the Oblinor admin API (pull-only sync, Phase 1).
// Auth mirrors the reference backend (oblinor-chat-backend/src/sync/wpClient.ts):
//   POST {base}/wp-json/oblinor/admin/v2/authenticate {username,password} → data.token
//   send token as a RAW `Authorization: <token>` header (NO "Bearer " prefix).
//   On 401, re-login once and retry.

import type { Env } from "./index";

export interface Page<T> {
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
  items: T[];
}

// One client per sync run; holds the token for the duration of the run.
export function createWpClient(env: Env) {
  // Accept base set either as "https://oblinor.no" or ".../wp-json" — normalize.
  const root = env.OBLINOR_WP_BASE.replace(/\/+$/, "").replace(/\/wp-json$/, "");
  let token: string | null = null;

  async function login(): Promise<string> {
    const res = await fetch(`${root}/wp-json/oblinor/admin/v2/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: env.OBLINOR_ADMIN_USERNAME,
        password: env.OBLINOR_ADMIN_PASSWORD,
      }),
    });
    if (!res.ok) {
      throw new Error(`wp login failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    const json = (await res.json()) as { token?: string };
    if (!json.token) throw new Error("wp login: no token in response");
    token = json.token;
    return token;
  }

  async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    );
    const url = `${root}${path}?${qs.toString()}`;

    const doFetch = async (auth: string) =>
      fetch(url, { headers: { Authorization: auth } });

    let res = await doFetch(token ?? (await login()));
    if (res.status === 401) {
      // token expired/invalid — re-auth once and retry
      res = await doFetch(await login());
    }
    if (!res.ok) {
      throw new Error(`wp GET ${path} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  return { get };
}

export type WpClient = ReturnType<typeof createWpClient>;
