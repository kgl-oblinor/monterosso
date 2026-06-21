// Dashboard sidebar icons — thin stroke line-art, matching the landing
// hub-tile icon language (fill:none, stroke:currentColor). Colour + size
// are driven by CSS (.dash__nav-btn svg), so these stay style-free.

export function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5z" />
    </svg>
  );
}

export function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}
