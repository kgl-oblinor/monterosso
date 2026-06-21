// Static fixtures backing the mock layer until the real endpoints ship.
import type { AuthUser } from "@/features/auth/api/types";

/** Small helper so mock calls feel like real async network requests. */
export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/** The code the mock password-reset flow always accepts (shown in dev as a hint). */
export const MOCK_OTP_CODE = "123456";

/** The "me" identity for mock outgoing messages. */
export const mockCurrentUser: AuthUser & { initials: string } = {
  email: "anna@example.com",
  name: "Anna Berg",
  role: "customer",
  initials: "AB",
};

export interface MockMessage {
  id: string;
  fromMe: boolean;
  sender: string;
  text: string;
  time: string; // "09:32"
}

export interface MockThread {
  id: string;
  name: string;
  initials: string;
  contactPerson: string;
  online: boolean;
  preview: string;
  timeLabel: string; // "09:48", "i går", "man."
  unread: number;
  messages: MockMessage[];
}

export const mockThreads: MockThread[] = [
  {
    id: "t1",
    name: "Andrea · Paolona",
    initials: "AP",
    contactPerson: "Andrea",
    online: true,
    preview: "Vi sees ved Molo dei Pescatori kl. 10.",
    timeLabel: "09:48",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Andrea",
        text: "Hei Anna! Takk for bestillingen — gleder meg til å vise dere kysten.",
        time: "09:32",
      },
      {
        id: "m2",
        fromMe: true,
        sender: "Anna Berg",
        text: "Så fint! Vi er to voksne. Er det greit med en liten kurv mat ombord?",
        time: "09:39",
      },
      {
        id: "m3",
        fromMe: false,
        sender: "Andrea",
        text: "Helt fint. Ta med solhatt — det blir fin sjø i morgen.",
        time: "09:41",
      },
      {
        id: "m4",
        fromMe: false,
        sender: "Andrea",
        text: "Vi sees ved Molo dei Pescatori kl. 10.",
        time: "09:46",
      },
    ],
  },
  {
    id: "t2",
    name: "Luca · Vernazza",
    initials: "LV",
    contactPerson: "Luca",
    online: true,
    preview: "Kan vi flytte avgangen til kl. 14?",
    timeLabel: "08:15",
    unread: 1,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Luca",
        text: "Kan vi flytte avgangen til kl. 14?",
        time: "08:15",
      },
    ],
  },
  {
    id: "t3",
    name: "Marco · Taxibåt",
    initials: "MT",
    contactPerson: "Marco",
    online: false,
    preview: "Takk, da er turen bekreftet.",
    timeLabel: "i går",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: true,
        sender: "Anna Berg",
        text: "Hei! Trenger skyss fra Riomaggiore til Monterosso søndag morgen.",
        time: "16:02",
      },
      {
        id: "m2",
        fromMe: false,
        sender: "Marco",
        text: "Takk, da er turen bekreftet.",
        time: "16:20",
      },
    ],
  },
  {
    id: "t4",
    name: "Sofia · Manarola",
    initials: "SM",
    contactPerson: "Sofia",
    online: false,
    preview: "Bildene fra turen er lastet opp.",
    timeLabel: "man.",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Sofia",
        text: "Bildene fra turen er lastet opp.",
        time: "11:00",
      },
    ],
  },
  {
    id: "t5",
    name: "Giulia · Corniglia",
    initials: "GC",
    contactPerson: "Giulia",
    online: false,
    preview: "Hei, passer solnedgangstur på fredag?",
    timeLabel: "fre.",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Giulia",
        text: "Hei, passer solnedgangstur på fredag?",
        time: "14:33",
      },
    ],
  },
];
