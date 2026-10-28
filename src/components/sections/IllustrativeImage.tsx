import Image from "next/image";

/**
 * A supplied illustrative photograph in a section panel: shown at its own
 * aspect ratio (so it is never stretched or awkwardly cropped), with its
 * dimensions reserved to avoid layout shift, and captioned as illustrative —
 * these are not photographs of a Genesis facility.
 */
export function IllustrativeImage({
  src,
  width,
  height,
  alt,
  sizes = "(min-width: 1024px) 600px, 100vw",
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-ring),var(--shadow-soft)]" style={{ aspectRatio: `${width} / ${height}` }}>
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} quality={90} className="h-full w-full object-cover" />
      <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.72rem] font-medium text-muted">Illustrative image</figcaption>
    </figure>
  );
}
