import Link from "next/link";

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link href={`/tag/${encodeURIComponent(tag)}`} className="tag-pill">
      #{tag}
    </Link>
  );
}
