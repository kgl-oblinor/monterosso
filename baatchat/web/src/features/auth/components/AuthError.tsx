/** Translucent error banner used across the auth screens. */
export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-200">
      {message}
    </div>
  );
}
