// Typed auth API. Swappable: when VITE_USE_MOCKS is off it calls the real backend,
// otherwise it uses the in-app mock. Both honor the same contracts in ./types.
// The backend wraps responses as { ok, ... }; we unwrap to the contract shapes here.
import { apiClient } from "@/lib/apiClient";
import { env } from "@/lib/env";
import { mockAuthApi } from "@/mocks/mockAuth";
import type {
  AccountStatus,
  AuthResult,
  AuthUser,
  LoginInput,
  MeResult,
  PasswordlessInput,
  RegisterCompleteInput,
  RegisterStartInput,
  StartResult,
} from "./types";

interface OkAuth {
  ok: true;
  token: string;
  user: AuthUser;
  status?: AccountStatus;
}
interface OkStart {
  ok: true;
  sentTo: string | null;
}
interface OkMe {
  ok: true;
  user: AuthUser;
  status: AccountStatus;
  emailVerified: boolean;
}

export interface AuthApi {
  passwordless(input: PasswordlessInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  adminLogin(input: LoginInput): Promise<AuthResult>;
  adminResetStart(email: string): Promise<StartResult>;
  adminResetVerify(email: string, code: string): Promise<AuthResult>;
  registerStart(input: RegisterStartInput): Promise<StartResult>;
  registerComplete(input: RegisterCompleteInput): Promise<AuthResult>;
  me(): Promise<MeResult>;
}

const realAuthApi: AuthApi = {
  async passwordless(input) {
    const r = await apiClient.post<OkAuth>("/auth/passwordless", input, { anonymous: true });
    return { token: r.token, user: r.user, status: r.status };
  },

  async login(input) {
    const r = await apiClient.post<OkAuth>("/auth/login", input, { anonymous: true });
    return { token: r.token, user: r.user, status: r.status };
  },

  async adminLogin(input) {
    const r = await apiClient.post<OkAuth>("/auth/admin-login", input, { anonymous: true });
    return { token: r.token, user: r.user };
  },

  async adminResetStart(email) {
    const r = await apiClient.post<OkStart>("/auth/admin-reset/start", { email }, { anonymous: true });
    return { sentTo: r.sentTo };
  },

  async adminResetVerify(email, code) {
    const r = await apiClient.post<OkAuth>(
      "/auth/admin-reset/verify",
      { email, code },
      { anonymous: true }
    );
    return { token: r.token, user: r.user };
  },

  async registerStart(input) {
    const r = await apiClient.post<OkStart>("/auth/register/start", input, { anonymous: true });
    return { sentTo: r.sentTo };
  },

  async registerComplete(input) {
    const r = await apiClient.post<OkAuth>("/auth/register/complete", input, { anonymous: true });
    return { token: r.token, user: r.user, status: r.status };
  },

  async me() {
    const r = await apiClient.get<OkMe>("/auth/me");
    return { user: r.user, status: r.status, emailVerified: r.emailVerified };
  },
};

export const authApi: AuthApi = env.useMocks ? mockAuthApi : realAuthApi;
