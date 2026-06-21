// Admin user-management contracts (mirror the backend's /admin/users shapes).

export type AccountStatus = "pending" | "active" | "suspended";

export interface AdminAccount {
  id: number;
  oblinorId: number;
  email: string;
  role: string; // "investor" | "loaner"
  name: string | null;
  emailVerified: boolean;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

// Full-directory rows (every synced party, registered or not). `accountId` is the
// chat_accounts.id when registered — needed to approve/revoke; null otherwise.
export interface DirectoryLoaner {
  id: number; // loaner_id
  accountId: number | null;
  orgNumber: string | null;
  name: string | null; // company_name
  contactPerson: string | null;
  email: string | null;
  loanCount: number;
  registered: boolean;
  status: AccountStatus | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export interface DirectoryInvestor {
  id: number; // user_id
  accountId: number | null;
  name: string | null;
  email: string | null;
  orderCount: number;
  registered: boolean;
  status: AccountStatus | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

// Admin read-only conversation oversight.
export interface AdminThread {
  id: number;
  loanerId: number;
  loanerName: string | null;
  investorId: number;
  investorName: string | null;
  status: string;
  lastMessageAt: string | null;
  preview: string | null;
  messageCount: number;
}

export interface AdminMessage {
  id: number;
  senderId: number;
  senderRole: string; // 'investor' | 'loaner'
  body: string;
  createdAt: string;
  editedAt: string | null;
}

// --- broadcast email --------------------------------------------------------

export type EmailAudience = "loaners" | "investors" | "all" | "selected";

export interface Recipient {
  id: number;
  type: "loaner" | "investor";
  name: string | null;
  email: string;
}

export interface SendEmailBody {
  audience: EmailAudience;
  selected?: { loaners?: number[]; investors?: number[] };
  subject: string;
  html: string;
  testTo?: string;
  confirm?: boolean;
}

export interface SendEmailResult {
  ok: boolean;
  test?: boolean;
  needsConfirm?: boolean;
  recipients?: number;
  sent?: number;
  failed?: number;
  errors?: string[];
}
