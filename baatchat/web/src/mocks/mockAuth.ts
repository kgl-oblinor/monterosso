// Mock implementation of the auth API (account-claim flow). Same shape as the real
// authApi so callers don't care which is active. The claim code is always MOCK_OTP_CODE.
import type { AuthApi } from "@/features/auth/api/authApi";
import type { AuthResult, MeResult } from "@/features/auth/api/types";
import { ApiError } from "@/lib/apiClient";
import { delay, MOCK_OTP_CODE } from "./fixtures";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain ?? "oblinor.no"}`;
}

export const mockAuthApi: AuthApi = {
  // Returning login → active (so the chat demo works).
  async login(input): Promise<AuthResult> {
    await delay();
    if (input.password.length < 8) throw new ApiError(401, "Feil e-post eller passord.");
    return { token: `mock.${btoa(input.email)}.jwt`, user: { email: input.email }, status: "active" };
  },

  async adminLogin(input): Promise<AuthResult> {
    await delay();
    if (input.password.length < 1) throw new ApiError(401, "Feil e-post eller passord.");
    return {
      token: `mock.admin.${btoa(input.email)}.jwt`,
      user: { email: input.email, role: "admin", name: input.email },
    };
  },

  async registerStart(input) {
    await delay();
    const where = input.email ? input.email : "post@firma.no";
    return { sentTo: maskEmail(where) };
  },

  async adminResetStart(email) {
    await delay();
    return { sentTo: maskEmail(email) };
  },

  async adminResetVerify(email, code): Promise<AuthResult> {
    await delay();
    if (code !== MOCK_OTP_CODE) throw new ApiError(400, "Ugyldig eller utløpt kode.");
    return {
      token: `mock.admin.${btoa(email)}.jwt`,
      user: { email, role: "admin", name: email },
    };
  },

  // New claim → pending (so the "awaiting approval" screen is demoable).
  async registerComplete(input): Promise<AuthResult> {
    await delay();
    if (input.code !== MOCK_OTP_CODE) throw new ApiError(400, "Ugyldig eller utløpt kode.");
    if (!input.password || input.password.length < 8)
      throw new ApiError(400, "Passord må være minst 8 tegn.");
    const email = input.email ?? "post@firma.no";
    return { token: `mock.${btoa(email)}.jwt`, user: { email }, status: "pending" };
  },

  async me(): Promise<MeResult> {
    await delay(200);
    return { user: { email: "demo@oblinor.no" }, status: "active", emailVerified: true };
  },
};
