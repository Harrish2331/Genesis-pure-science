"use client";

import { useRef, useState } from "react";

/**
 * Company-introduction film, once supplied. Nothing downloads until the
 * visitor presses play (preload="none"); it plays muted with native controls
 * so the visitor decides about sound.
 */
export function IntroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <figure className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-panel)] bg-ink shadow-[var(--shadow-soft)]">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        preload="none"
        playsInline
        muted
        controls={started}
        onPlay={() => setStarted(true)}
      >
        Your browser cannot play this video.
      </video>
      {!started ? (
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            void ref.current?.play();
          }}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/40 to-transparent"
          aria-label="Play the Genesis introduction video"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-action shadow-xl transition-transform hover:scale-105">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
            </svg>
          </span>
        </button>
      ) : null}
      <figcaption className="sr-only">Genesis Pure Lifesciences introduction video</figcaption>
    </figure>
  );
}
