// Lane A · Chat — the send box. Calm, single-action ("Send").
// Controlled textarea; Enter sends, Shift+Enter makes a newline.

"use client";

import { useState } from "react";

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState("");

  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="krin-composer">
      <textarea
        className="krin-composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write to your skipper…"
        rows={1}
        disabled={disabled}
      />
      <button
        className="krin-composer__send"
        onClick={send}
        disabled={disabled || text.trim().length === 0}
      >
        Send
      </button>
    </div>
  );
}
