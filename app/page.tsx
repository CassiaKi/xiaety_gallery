import { GalleryCard } from "@/components/gallery-card";
import { getAllGalleries } from "@/lib/content";

export default async function HomePage() {
  const galleries = await getAllGalleries();

  return (
    <section className="album-grid">
      {galleries.map((gallery) => (
        <GalleryCard key={gallery.slug} gallery={gallery} />
      ))}
    </section>
  );
}
