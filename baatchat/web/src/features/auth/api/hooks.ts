import { useMutation, useQuery } from "@tanstack/react-query";

import { authApi } from "./authApi";
import type { JoinInput, LoginInput, PasswordlessInput, RegisterCompleteInput, RegisterStartInput } from "./types";

// Passwordless entry — the main way in. One identifier (email OR phone), straight to a session.
export function usePasswordless() {
  return useMutation({ mutationFn: (input: PasswordlessInput) => authApi.passwordless(input) });
}

// Invite landing (/join): preview which trip the link points at, then join passwordlessly.
export function useInvitePreview(token: string | null) {
  return useQuery({
    queryKey: ["invitePreview", token],
    enabled: !!token,
    retry: false,
    queryFn: () => authApi.joinPreview(token as string),
  });
}

export function useJoin() {
  return useMutation({ mutationFn: (input: JoinInput) => authApi.join(input) });
}

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
