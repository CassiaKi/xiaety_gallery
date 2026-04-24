import { GalleryCard } from "@/components/gallery-card";
import { getAllGalleries } from "@/lib/content";

export const metadata = {
  title: "图库"
};

export default async function GalleryIndexPage() {
  const galleries = await getAllGalleries();

  return (
    <section className="page-section">
      <div className="panel">
        <div className="section-label">Gallery archive</div>
        <h1 className="page-title">图库</h1>
        <p className="lead">列表页只加载缩略图，点进详情页后再按需加载更高质量的预览图与原图。</p>
      </div>
      <div className="masonry-grid" style={{ marginTop: 22 }}>
        {galleries.map((gallery) => (
          <GalleryCard key={gallery.slug} gallery={gallery} />
        ))}
      </div>
    </section>
  );
}
