import { GalleryFeed } from "@/components/gallery-feed";
import { getAllGalleryImageSections } from "@/lib/content";

export const metadata = {
  title: "图库"
};

export default async function GalleryIndexPage() {
  const sections = await getAllGalleryImageSections();

  return <GalleryFeed sections={sections} />;
}
