// Auth API contracts — match the backend's account-claim flow:
//   register/start  (email OR orgNumber) → sends a code to the on-file email
//   register/complete (identifier + code + password) → creates the account, returns a JWT
//   login (email + password) → returns a JWT
// Existing Oblinor participants only; name/role come from the synced data, not the form.

export type UserRole = "loaner" | "investor" | "admin";

export interface AuthUser {
  id?: number;
  email: string;
  name?: string | null;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Identifier for the claim flow: investors use email, loaners use orgNumber (email works too). */
export interface RegisterStartInput {
  email?: string;
  orgNumber?: string;
}

export interface RegisterCompleteInput extends RegisterStartInput {
  code: string;
  password: string;
}

export type AccountStatus = "pending" | "active" | "suspended";

export interface AuthResult {
  token: string;
  user: AuthUser;
  /** Approval status (investors/loaners). Undefined for admins. */
  status?: AccountStatus;
}

export interface MeResult {
  user: AuthUser;
  status: AccountStatus;
  emailVerified: boolean;
}

export interface StartResult {
  /** Masked on-file email the code was sent to, or null (generic — no account match). */
  sentTo: string | null;
}
