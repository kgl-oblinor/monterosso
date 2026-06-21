// Admin (Kristian) management contracts (mirror the backend's /admin shapes).

export type AccountStatus = "pending" | "active" | "suspended";

export interface AdminAccount {
  id: number;
  partyId: number;
  email: string;
  role: string; // "skipper" | "customer"
  name: string | null;
  emailVerified: boolean;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

// Full-directory rows (every skipper/customer, onboarded or not). `accountId` is the
// chat_accounts.id when registered — needed to approve/revoke; null otherwise.
export interface DirectorySkipper {
  id: number; // skipper_id
  accountId: number | null;
  name: string | null;
  boatName: string | null;
  serviceType: string;
  location: string | null;
  email: string | null;
  reservationCount: number;
  registered: boolean;
  status: AccountStatus | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export interface DirectoryCustomer {
  id: number; // customer_id
  accountId: number | null;
  name: string | null;
  email: string | null;
  reservationCount: number;
  registered: boolean;
  status: AccountStatus | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

// --- skipper management (add / edit a listing) ------------------------------
// Mirrors the shared /admin/skippers contract (snake_case from the Worker).

export type ServiceType = "charter" | "taxi" | "freight";

/** A skipper/listing as returned by GET/POST/PUT /admin/skippers. */
export interface Skipper {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  country: string | null;
  boat_name: string | null;
  service_type: ServiceType;
  slots: string | null; // JSON array of departure times, e.g. ["10:00","14:00"]
  base_price: number | null; // cents
  currency: string | null;
  payment_ref: string | null; // Stripe reference (may be empty for now)
  active: boolean;
  created: string;
}

/** Body for POST/PUT /admin/skippers (no id/active/created — server-managed). */
export interface SkipperInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  country: string;
  boat_name: string;
  service_type: ServiceType;
  slots: string; // JSON array string
  base_price: number; // cents
  currency: string;
  payment_ref: string;
}

// Admin read-only conversation oversight.
export interface AdminThread {
  id: number;
  skipperId: number;
  skipperName: string | null;
  customerId: number;
  customerName: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  messageCount: number;
}

export interface AdminMessage {
  id: number;
  senderId: number;
  senderRole: string; // 'skipper' | 'customer'
  body: string;
  createdAt: string;
  editedAt: string | null;
}
