import { notFound } from "next/navigation";

import { getSkipper } from "../../../lib/skippers";
import SkipperLanding from "./SkipperLanding";
import "./skipper.css";

// Config-driven public landing for one skipper, at /s/<slug> (e.g. /s/andrea).
// The entire page renders from the skipper's config object (lib/skippers.js) — a
// different config produces a different page with zero code changes.
//
// force-dynamic so the D1-backed version (see getSkipper's seam) would show live
// edits immediately, rather than a long-lived SSG cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = getSkipper(slug);
  if (!s) return { title: "Not found" };
  return {
    title: `${s.listingTitle} · ${s.location}`,
    description: s.intro,
  };
}

export default async function SkipperPage({ params }) {
  const { slug } = await params;
  const skipper = getSkipper(slug);
  if (!skipper) notFound();
  return <SkipperLanding config={skipper} />;
}
