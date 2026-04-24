import { GalleryCard } from "@/components/gallery-card";
import { PostCard } from "@/components/post-card";
import { getAllGalleries, getAllPosts, getAllTags } from "@/lib/content";

type Props = {
  params: { tag: string };
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: Props) {
  const decodedTag = decodeURIComponent(params.tag);
  const [galleries, posts] = await Promise.all([getAllGalleries(), getAllPosts()]);
  const taggedGalleries = galleries.filter((gallery) => gallery.tags.includes(decodedTag));
  const taggedPosts = posts.filter((post) => post.tags.includes(decodedTag));

  return (
    <section className="page-section">
      <div className="panel">
        <div className="section-label">Tag view</div>
        <h1 className="page-title">#{decodedTag}</h1>
        <p className="lead">统一聚合带有相同标签的图库与文章，保持纯静态生成。</p>
      </div>

      {taggedGalleries.length ? (
        <>
          <div className="section-head" style={{ marginTop: 24 }}>
            <div>
              <div className="section-label">Galleries</div>
              <h2>作品</h2>
            </div>
          </div>
          <div className="masonry-grid">
            {taggedGalleries.map((gallery) => (
              <GalleryCard key={gallery.slug} gallery={gallery} />
            ))}
          </div>
        </>
      ) : null}

      {taggedPosts.length ? (
        <>
          <div className="section-head" style={{ marginTop: 24 }}>
            <div>
              <div className="section-label">Posts</div>
              <h2>文章</h2>
            </div>
          </div>
          <div className="grid-2">
            {taggedPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
