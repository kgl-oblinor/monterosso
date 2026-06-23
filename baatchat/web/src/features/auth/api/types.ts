// Auth API contracts — match the backend's account-onboarding flow:
//   register/start  (email OR reservationCode) → sends a code to the on-file email
//   register/complete (identifier + code + password) → creates the account, returns a JWT
//   login (email + password) → returns a JWT
// name/role come from the booking data, not the form.

export type UserRole = "skipper" | "customer" | "admin";

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

/** Identifier for the onboarding flow: by email, by phone/WhatsApp, or by reservation
 *  code (customers). One of them is enough — no friction. */
export interface RegisterStartInput {
  email?: string;
  phone?: string;
  reservationCode?: string;
}

export interface RegisterCompleteInput extends RegisterStartInput {
  code: string;
  password: string;
}

export type AccountStatus = "pending" | "active" | "suspended";

export interface AuthResult {
  token: string;
  user: AuthUser;
  /** Approval status (customers/skippers). Undefined for admins. */
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
