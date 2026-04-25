import { notFound } from "next/navigation";
import { LightboxGallery } from "@/components/lightbox-gallery";
import { TagLink } from "@/components/tag-link";
import { getAllGalleries, getGalleryBySlug } from "@/lib/content";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const galleries = await getAllGalleries();
  return galleries.map((gallery) => ({ slug: gallery.slug }));
}

export async function generateMetadata({ params }: Props) {
  const gallery = await getGalleryBySlug(params.slug);
  if (!gallery) {
    return {};
  }

  return {
    title: gallery.title,
    description: gallery.summary
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const gallery = await getGalleryBySlug(params.slug);
  if (!gallery) {
    notFound();
  }

  return (
    <article className="article-shell">
      <div className="detail-head">
        <div className="section-label">Gallery</div>
        <div className="article-meta">{gallery.dateLabel}</div>
      </div>
      <h1 className="article-title">{gallery.title}</h1>
      {gallery.summary ? <p className="lead">{gallery.summary}</p> : null}
      {gallery.tags.length ? (
        <div className="tag-row">
          {gallery.tags.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
      {gallery.html ? (
        <div className="article-body" dangerouslySetInnerHTML={{ __html: gallery.html }} />
      ) : null}
      <LightboxGallery images={gallery.images} title={gallery.title} />
    </article>
  );
}
