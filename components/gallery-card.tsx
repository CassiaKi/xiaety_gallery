import Link from "next/link";
import type { GalleryEntry } from "@/lib/content";

export function GalleryCard({ gallery }: { gallery: GalleryEntry }) {
  return (
    <Link href={`/gallery/${gallery.slug}`} className="card">
      <div
        className="card__image"
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
      <div className="card__body">
        <div className="card__meta">
          {gallery.dateLabel} · {gallery.images.length} 张
        </div>
        <h3>{gallery.title}</h3>
        <p className="card__summary">{gallery.summary}</p>
        <div className="tag-row">
          {gallery.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
