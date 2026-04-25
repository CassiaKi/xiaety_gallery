import { GalleryFeed } from "@/components/gallery-feed";
import { getAllGalleryImageSections } from "@/lib/content";

export default async function HomePage() {
  const sections = await getAllGalleryImageSections();

  return <GalleryFeed sections={sections} />;
}
