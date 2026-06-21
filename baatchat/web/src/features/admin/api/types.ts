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
