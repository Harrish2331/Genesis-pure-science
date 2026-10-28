import { WhatsAppIcon } from "@/components/ui/Icons";

/**
 * Floating WhatsApp shortcut, on every public page.
 *
 * A plain click-to-chat link (https://wa.me/<number>?text=…): it opens the
 * WhatsApp app on phones and WhatsApp Web on desktop with the enquiry
 * pre-filled. Nothing is sent until the visitor presses send in WhatsApp.
 * It sits bottom-right, clear of the safe-area inset, and is 56px — an easy
 * tap target that does not cover page content on narrow screens.
 */
export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Genesis on WhatsApp (opens WhatsApp with a pre-filled enquiry)"
      className="group fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-[0_12px_30px_-8px_rgb(18_112_74/0.6)] ring-4 ring-white/80 transition-transform duration-300 hover:scale-105 focus-visible:scale-105"
      style={{ right: "max(1.25rem, env(safe-area-inset-right))", bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <span className="absolute inset-0 -z-10 animate-[g-pulse_3.2s_ease-in-out_infinite] rounded-full bg-[#1fa855]/35" aria-hidden="true" />
      <WhatsAppIcon size={28} />
      <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
