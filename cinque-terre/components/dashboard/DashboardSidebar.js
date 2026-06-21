"use client";

import { ChatIcon, ProfileIcon } from "./Icons";

// The CLOSED (narrow) left sidebar: a chat icon pinned to the TOP, a
// profile icon pinned to the BOTTOM, and nothing in between (space-between
// in dashboard.css does the pinning).
//
// Props (all optional — the bare shell works with none):
//   active      "chat" | "profile" — which view is current (gold accent)
//   onChat()    handler for the chat icon
//   onProfile() handler for the profile icon
export default function DashboardSidebar({ active, onChat, onProfile }) {
  return (
    <nav className="dash__sidebar" aria-label="Dashboard">
      <button
        type="button"
        className={"dash__nav-btn" + (active === "chat" ? " is-active" : "")}
        aria-label="Chat"
        aria-current={active === "chat" ? "page" : undefined}
        onClick={onChat}
      >
        <ChatIcon />
      </button>

      <button
        type="button"
        className={"dash__nav-btn" + (active === "profile" ? " is-active" : "")}
        aria-label="Profile"
        aria-current={active === "profile" ? "page" : undefined}
        onClick={onProfile}
      >
        <ProfileIcon />
      </button>
    </nav>
  );
}
