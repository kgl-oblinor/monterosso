import { useMutation } from "@tanstack/react-query";

import { authApi } from "./authApi";
import type { LoginInput, RegisterCompleteInput, RegisterStartInput } from "./types";

export function useLogin() {
  return useMutation({ mutationFn: (input: LoginInput) => authApi.login(input) });
}

export function useAdminLogin() {
  return useMutation({ mutationFn: (input: LoginInput) => authApi.adminLogin(input) });
}

// Admin recovery: step 1 emails a code to the allow-listed admin address, step 2 verifies
// it and returns an admin session (no password needed).
export function useAdminResetStart() {
  return useMutation({ mutationFn: (email: string) => authApi.adminResetStart(email) });
}

export function useAdminResetVerify() {
  return useMutation({
    mutationFn: (input: { email: string; code: string }) =>
      authApi.adminResetVerify(input.email, input.code),
  });
}

// Claim flow: step 1 sends the code, step 2 sets the password and returns a session.
export function useRegisterStart() {
  return useMutation({ mutationFn: (input: RegisterStartInput) => authApi.registerStart(input) });
}

export function useRegisterComplete() {
  return useMutation({
    mutationFn: (input: RegisterCompleteInput) => authApi.registerComplete(input),
  });
}

// Re-check the current approval status (used by the pending-approval screen).
export function useRefreshStatus() {
  return useMutation({ mutationFn: () => authApi.me() });
}
