"use client";

import { useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import "./dashboard.css";

// The desktop dashboard shell: a closed left sidebar + a large content
// area on the right. The shell owns the frame only — chat (Lane A) and
// admin/skipper (Lane C) drop their own UI in via `children`. With no
// children it renders a clean empty area.
//
// Props (all optional):
//   active      "chat" | "profile" — current view (sidebar accent)
//   onChat()    chat icon handler
//   onProfile() profile icon handler
//   children    content for the right-hand area
export default function DashboardShell({ active, onChat, onProfile, children }) {
  // Scope the cream page background to the shell so the dark landing body
  // never bleeds around the edges, and restore it on unmount.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#f7f1e3";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  return (
    <div className="dash">
      <DashboardSidebar active={active} onChat={onChat} onProfile={onProfile} />
      <main className="dash__content">
        {children ?? <div className="dash__empty" aria-hidden="true" />}
      </main>
    </div>
  );
}
