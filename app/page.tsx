import { GalleryFeed } from "@/components/gallery-feed";
import { getAllGalleryImages } from "@/lib/content";

export default async function HomePage() {
  const images = await getAllGalleryImages();

  return <GalleryFeed images={images} />;
}
