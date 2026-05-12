import { GalleryCard } from "@/components/gallery-card";
import { getAllGalleries } from "@/lib/content";

export const metadata = {
  title: "图库"
};

export default async function GalleryIndexPage() {
  const galleries = await getAllGalleries();

  return (
    <section className="album-grid">
      {galleries.map((gallery) => (
        <GalleryCard key={gallery.slug} gallery={gallery} />
      ))}
    </section>
  );
}
