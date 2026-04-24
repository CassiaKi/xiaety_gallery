import Link from "next/link";
import { notFound } from "next/navigation";
import { LightboxGallery } from "@/components/lightbox-gallery";
import { TagLink } from "@/components/tag-link";
import { getAllPosts, getGalleryBySlug, getPostBySlug } from "@/lib/content";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const relatedGalleries = await Promise.all(
    post.relatedGalleries.map(async (slug) => getGalleryBySlug(slug))
  );

  return (
    <article className="article-shell">
      <div className="article-meta">{post.dateLabel}</div>
      <h1 className="article-title">{post.title}</h1>
      <p className="lead">{post.summary}</p>
      <div className="tag-row">
        {post.tags.map((tag) => (
          <TagLink key={tag} tag={tag} />
        ))}
      </div>
      {post.cover ? (
        <div className="detail-cover">
          <img
            src={post.cover.preview.src}
            alt={post.cover.alt}
            width={post.cover.preview.width}
            height={post.cover.preview.height}
          />
        </div>
      ) : null}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      {post.images.length ? <LightboxGallery images={post.images} title={post.title} /> : null}
      {relatedGalleries.filter(Boolean).length ? (
        <div className="panel">
          <div className="section-label">Related galleries</div>
          <div className="tag-row" style={{ marginTop: 12 }}>
            {relatedGalleries
              .filter((gallery): gallery is NonNullable<typeof gallery> => Boolean(gallery))
              .map((gallery) => (
                <Link key={gallery.slug} href={`/gallery/${gallery.slug}`} className="ghost-button">
                  {gallery.title}
                </Link>
              ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
