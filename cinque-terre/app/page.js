import Landing from "./Landing";

// Render on each request so a deploy's content shows immediately, instead of
// being served from the long-lived (1-year) full-route SSG cache.
export const dynamic = "force-dynamic";

export default function Home() {
  return <Landing />;
}
