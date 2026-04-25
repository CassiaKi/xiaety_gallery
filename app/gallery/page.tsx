import { GalleryFeed } from "@/components/gallery-feed";
import { getAllGalleryImages } from "@/lib/content";

export const metadata = {
  title: "图库"
};

export default async function GalleryIndexPage() {
  const images = await getAllGalleryImages();

  return <GalleryFeed images={images} />;
}
