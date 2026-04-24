import Link from "next/link";
import type { PostEntry } from "@/lib/content";

export function PostCard({ post }: { post: PostEntry }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card">
      {post.cover ? (
        <div
          className="card__image"
          style={{
            aspectRatio: `${post.cover.thumb.width} / ${post.cover.thumb.height}`
          }}
        >
          <img
            src={post.cover.thumb.src}
            alt={post.cover.alt}
            width={post.cover.thumb.width}
            height={post.cover.thumb.height}
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="card__body">
        <div className="card__meta">{post.dateLabel}</div>
        <h3>{post.title}</h3>
        <p className="card__summary">{post.summary}</p>
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
