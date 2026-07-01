/** Translucent error banner used across the auth screens. */
export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-input border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}
