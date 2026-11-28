/**
 * The typeset brand name for the navigation bar: GENESIS, with
 * PURE LIFESCIENCES beneath it.
 *
 * The tagline is spread letter by letter across the full width of the name
 * (flex, space-between), so the two lines always end flush on both sides at
 * any size — the lock-up of a printed letterhead, not two lines of text that
 * merely start together. Screen readers get the name once, as plain text.
 *
 * The approved logo artwork itself is in ./Logo (used in the menu panel, the
 * footer and, as the symbol, at the right of the bar).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className="sr-only">Genesis Pure Lifesciences</span>
      <span
        aria-hidden="true"
        className="font-display text-[1.3rem] font-semibold leading-none tracking-[0.2em] text-ink sm:text-[1.45rem] xl:text-[1.6rem]"
        // The last letter's tracking would leave a gap on the right; pull it back so the edges are true.
        style={{ marginRight: "-0.2em" }}
      >
        GENESIS
      </span>
      <span
        aria-hidden="true"
        className="mt-[0.45rem] flex justify-between text-[0.5rem] font-semibold leading-none text-slate sm:text-[0.54rem] xl:text-[0.58rem]"
      >
        {"PURE LIFESCIENCES".split("").map((ch, i) => (
          <span key={i} className={ch === " " ? "w-[0.6em]" : ""}>
            {ch === " " ? "" : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
