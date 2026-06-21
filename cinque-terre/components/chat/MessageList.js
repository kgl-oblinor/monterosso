// Lane A · Chat — scrollable list of messages, newest at the bottom.

import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="krin-msglist">
        <p className="krin-msglist__empty">
          No messages yet — say hello to your skipper.
        </p>
      </div>
    );
  }

  return (
    <div className="krin-msglist">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          sender={m.sender}
          text={m.text}
          ts={m.ts}
        />
      ))}
    </div>
  );
}
