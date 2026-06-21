// Lane A · Chat — thread view for one reservation code.
// Customer side: loads the thread by code, lets them write to the skipper.
// Data flows through /api/messages (GET ?code= , POST {code, text}).
// The captain/admin side (Lane C) reads the same messages by code.

"use client";

import { use, useCallback, useEffect, useState } from "react";
import MessageList from "../../../components/chat/MessageList";
import Composer from "../../../components/chat/Composer";
import "../../../components/chat/chat.css";

export default function ChatThread({ params }) {
  // Next.js 15: params is a promise.
  const { code } = use(params);

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/messages?code=" + encodeURIComponent(code)
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // Network/stub errors are non-fatal for the scaffold.
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async (text) => {
    setSending(true);
    // Optimistic: show the message immediately, reconcile on reload.
    const optimistic = {
      id: "tmp-" + Date.now(),
      sender: "customer",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, sender: "customer", text }),
      });
      await load();
    } catch {
      // Leave the optimistic bubble in place if the POST fails.
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="krin-chat">
      <header className="krin-chat__head">
        <p className="krin-chat__script">Your skipper</p>
        <h1 className="krin-chat__title">Monterosso · Cinque Terre</h1>
        <p className="krin-chat__code">Reservation {code}</p>
      </header>

      <MessageList messages={messages} />

      <Composer onSend={handleSend} disabled={sending} />
    </main>
  );
}
