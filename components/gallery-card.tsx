import Link from "next/link";
import type { GalleryEntry } from "@/lib/content";

export function GalleryCard({ gallery }: { gallery: GalleryEntry }) {
  return (
    <Link href={`/gallery/${gallery.slug}`} className="card card--minimal">
      <div
        className="card__image card__image--minimal"
        style={{
          aspectRatio: `${gallery.cover.thumb.width} / ${gallery.cover.thumb.height}`
        }}
      >
        <img
          src={gallery.cover.thumb.src}
          alt={gallery.cover.alt}
          width={gallery.cover.thumb.width}
          height={gallery.cover.thumb.height}
          loading="lazy"
        />
      </div>
    </Link>
  );
}
