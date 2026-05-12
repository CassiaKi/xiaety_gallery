import Link from "next/link";
import type { GalleryEntry } from "@/lib/content";

export function GalleryCard({ gallery }: { gallery: GalleryEntry }) {
  return (
    <Link href={`/gallery/${gallery.slug}`} className="album-card">
      <div className="album-card__cover">
        <img
          src={gallery.cover.thumb.src}
          alt={gallery.cover.alt}
          width={gallery.cover.thumb.width}
          height={gallery.cover.thumb.height}
          loading="lazy"
        />

        <div className="album-card__floating-meta">
          <span className="album-card__kicker">Gallery</span>
          <h2 className="album-card__title">{gallery.title}</h2>
          <p className="album-card__count">{gallery.count} 张</p>
        </div>
      </div>
    </Link>
  );
}
