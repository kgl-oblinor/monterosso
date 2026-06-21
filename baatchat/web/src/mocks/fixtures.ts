// Static fixtures backing the mock layer until the real endpoints ship.
import type { AuthUser } from "@/features/auth/api/types";

/** Small helper so mock calls feel like real async network requests. */
export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/** The code the mock password-reset flow always accepts (shown in dev as a hint). */
export const MOCK_OTP_CODE = "123456";

/** The "me" identity for mock outgoing messages. */
export const mockCurrentUser: AuthUser & { initials: string } = {
  email: "ole@oblinor.no",
  name: "Ole Pedersen",
  role: "investor",
  initials: "OP",
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
    name: "Pro Bolig AS",
    initials: "PB",
    contactPerson: "Patrik Holshus",
    online: true,
    preview: "Vi tar en intern gjennomgang og …",
    timeLabel: "09:48",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Patrik Holshus",
        text: "Hei! Vi har lastet opp den oppdaterte fremdriftsplanen for byggeprosjektet.",
        time: "09:32",
      },
      {
        id: "m2",
        fromMe: true,
        sender: "Ole Pedersen",
        text: "Takk, Patrik. Jeg ser på den nå – ser bra ut så langt.",
        time: "09:39",
      },
      {
        id: "m3",
        fromMe: false,
        sender: "Patrik Holshus",
        text: "Flott. Gi beskjed hvis dere trenger mer dokumentasjon før neste utbetaling.",
        time: "09:41",
      },
      {
        id: "m4",
        fromMe: true,
        sender: "Ole Pedersen",
        text: "Vi tar en intern gjennomgang og kommer tilbake innen fredag.",
        time: "09:46",
      },
    ],
  },
  {
    id: "t2",
    name: "Veien Hjem AS",
    initials: "VH",
    contactPerson: "Mona Lie",
    online: true,
    preview: "Kan vi flytte møtet til torsdag?",
    timeLabel: "08:15",
    unread: 1,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Mona Lie",
        text: "Kan vi flytte møtet til torsdag?",
        time: "08:15",
      },
    ],
  },
  {
    id: "t3",
    name: "FT Bolig AS",
    initials: "FT",
    contactPerson: "Tom Eide",
    online: false,
    preview: "Takk for oppdateringen.",
    timeLabel: "i går",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: true,
        sender: "Ole Pedersen",
        text: "Her er den oppdaterte avtalen.",
        time: "16:02",
      },
      {
        id: "m2",
        fromMe: false,
        sender: "Tom Eide",
        text: "Takk for oppdateringen.",
        time: "16:20",
      },
    ],
  },
  {
    id: "t4",
    name: "ABC Bolig AS",
    initials: "AB",
    contactPerson: "Siri Berg",
    online: false,
    preview: "Signert avtale er lastet opp.",
    timeLabel: "man.",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Siri Berg",
        text: "Signert avtale er lastet opp.",
        time: "11:00",
      },
    ],
  },
  {
    id: "t5",
    name: "Bolig AS",
    initials: "BO",
    contactPerson: "Erik Hansen",
    online: false,
    preview: "Hei, har dere fått fakturaen?",
    timeLabel: "fre.",
    unread: 0,
    messages: [
      {
        id: "m1",
        fromMe: false,
        sender: "Erik Hansen",
        text: "Hei, har dere fått fakturaen?",
        time: "14:33",
      },
    ],
  },
];
