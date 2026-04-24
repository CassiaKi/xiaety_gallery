import { getAllGalleries, getAllPosts, getAllTags } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default async function sitemap() {
  const [galleries, posts, tags] = await Promise.all([
    getAllGalleries(),
    getAllPosts(),
    getAllTags()
  ]);

  return [
    "",
    "/gallery",
    "/blog",
    "/about",
    ...galleries.map((gallery) => `/gallery/${gallery.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
    ...tags.map((tag) => `/tag/${encodeURIComponent(tag)}`)
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date().toISOString()
  }));
}
