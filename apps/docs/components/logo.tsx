import { useId } from "react";

/**
 * THE MARK (2026-09-27, Kushagra's drawing). The word says the name; this says it without
 * words, and the two sit together in the masthead.
 *
 * `currentColor` and a height in `em`, so it takes the ink and the size of whatever it stands
 * beside rather than stating either — the same arrangement `Wordmark` uses for its face. Its
 * own aspect ratio does the width, so nothing here is a second measurement to keep in step.
 *
 * `aria-hidden` because it is a picture of the name: every placement carries the name on the
 * link around it, and an announced mark beside an announced word says it twice.
 */
export function Logo({ height = "1.15em" }: { height?: string }) {
  return (
    <svg
      viewBox="0 0 50 66"
      fill="currentColor"
      aria-hidden="true"
      style={{ height, width: "auto", display: "block", flex: "none" }}
    >
      <rect width="24" height="50" rx="12" />
      <path d="M26 12C26 5.37258 31.3726 0 38 0V0C44.6274 0 50 5.37258 50 12V12C50 18.6274 44.6274 24 38 24H26V12Z" />
      <path d="M26 26H30C41.0457 26 50 34.9543 50 46V54C50 60.6274 44.6274 66 38 66V66C31.3726 66 26 60.6274 26 54V26Z" />
    </svg>
  );
}

/**
 * THE PAIR (2026-10-26, Kushagra): Womp's Design System is made by Kushagra for Womp, so its
 * masthead shows both marks, the K then Womp's W overlapping it a little, with no discs behind
 * them. The K is cut where the W covers it, by a mask of the W's own outline grown by a hair, so
 * the gap shows whatever is behind the pair and needs no colour of its own. The favicon keeps
 * the K alone, since two marks do not read at tab size.
 */
export function LogoGroup({ height = "1.15em" }: { height?: string }) {
  const id = `kw${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  // The W is a square as tall as the pair; the K is 0.8 of that, centred, and the W starts a
  // little before the K ends.
  const H = 82.5;
  const wx = 50 - H * 0.12;
  const w = { href: "/logos/womp.png", x: wx, y: 0, width: H, height: H };
  return (
    <svg
      viewBox={`0 0 ${wx + H} ${H}`}
      aria-hidden="true"
      style={{ height, width: "auto", display: "block", flex: "none" }}
    >
      <defs>
        <filter id={`${id}-grow`}>
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" />
        </filter>
        <mask id={`${id}-cut`} maskUnits="userSpaceOnUse" x="0" y="0" width={wx + H} height={H}>
          <rect width={wx + H} height={H} fill="white" />
          <image {...w} filter={`url(#${id}-grow)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-cut)`} fill="currentColor" transform={`translate(0 ${(H - 66) / 2})`}>
        <rect width="24" height="50" rx="12" />
        <path d="M26 12C26 5.37258 31.3726 0 38 0V0C44.6274 0 50 5.37258 50 12V12C50 18.6274 44.6274 24 38 24H26V12Z" />
        <path d="M26 26H30C41.0457 26 50 34.9543 50 46V54C50 60.6274 44.6274 66 38 66V66C31.3726 66 26 60.6274 26 54V26Z" />
      </g>
      <image {...w} />
    </svg>
  );
}
