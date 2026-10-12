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
