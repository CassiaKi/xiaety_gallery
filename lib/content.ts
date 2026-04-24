import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { renderMarkdown } from "./markdown";

type ImageManifestVariant = {
  src: string;
  width: number;
  height: number;
  bytes: number;
};

type ImageManifestItem = {
  id: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  blurDataURL: string;
  thumb: ImageManifestVariant;
  preview: ImageManifestVariant;
  full: ImageManifestVariant;
};

type RawImageMeta = {
  file: string;
  alt: string;
  caption?: string;
};

type GalleryFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  series?: string;
  cover: string;
  published?: boolean;
};

type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  cover?: string;
  relatedGalleries?: string[];
  published?: boolean;
};

export type GalleryImage = ImageManifestItem;

export type GalleryEntry = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  summary: string;
  tags: string[];
  series?: string;
  cover: GalleryImage;
  images: GalleryImage[];
  html: string;
};

export type PostEntry = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  summary: string;
  tags: string[];
  cover?: GalleryImage;
  images: GalleryImage[];
  html: string;
  relatedGalleries: string[];
};

const contentRoot = path.join(process.cwd(), "content");
const generatedManifestPath = path.join(process.cwd(), "public", "generated", "image-manifest.json");

let manifestCache: Record<string, ImageManifestItem> | null = null;

async function readManifest() {
  if (manifestCache) {
    return manifestCache;
  }

  try {
    const raw = await fs.readFile(generatedManifestPath, "utf8");
    manifestCache = JSON.parse(raw) as Record<string, ImageManifestItem>;
    return manifestCache;
  } catch (error) {
    throw new Error(
      `Missing generated image manifest at ${generatedManifestPath}. Run the image build step before rendering pages.`,
      { cause: error }
    );
  }
}

async function readDirectoryNames(targetPath: string) {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function readContentFile<TFrontmatter>(baseDir: string, slug: string) {
  const folderPath = path.join(contentRoot, baseDir, slug);
  const markdownPath = path.join(folderPath, "index.md");
  const imagesPath = path.join(folderPath, "images.json");

  const [markdownRaw, imagesRaw] = await Promise.all([
    fs.readFile(markdownPath, "utf8"),
    fs.readFile(imagesPath, "utf8")
  ]);

  const parsed = matter(markdownRaw);
  const html = await renderMarkdown(parsed.content);

  return {
    folderPath,
    frontmatter: parsed.data as TFrontmatter,
    html,
    imagesMeta: JSON.parse(imagesRaw) as RawImageMeta[]
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}

async function resolveImages(
  collection: "galleries" | "posts",
  slug: string,
  imagesMeta: RawImageMeta[]
) {
  const manifest = await readManifest();

  return imagesMeta.map((image) => {
    const key = `${collection}/${slug}/${image.file}`;
    const generated = manifest[key];
    if (!generated) {
      throw new Error(`Generated image metadata not found for ${key}`);
    }

    return {
      ...generated,
      alt: image.alt,
      caption: image.caption
    };
  });
}

function assertPublished(flag: boolean | undefined) {
  return flag !== false;
}

export async function getAllGalleries() {
  const slugs = await readDirectoryNames(path.join(contentRoot, "galleries"));
  const galleries = await Promise.all(
    slugs.map(async (slug): Promise<GalleryEntry | null> => {
      const { frontmatter, html, imagesMeta } = await readContentFile<GalleryFrontmatter>("galleries", slug);
      if (!assertPublished(frontmatter.published)) {
        return null;
      }

      const images = await resolveImages("galleries", slug, imagesMeta);
      const cover = images.find((image) => image.id.endsWith(`/${frontmatter.cover}`));
      if (!cover) {
        throw new Error(`Cover image "${frontmatter.cover}" not found for gallery "${slug}"`);
      }

      return {
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        dateLabel: formatDate(frontmatter.date),
        summary: frontmatter.summary,
        tags: frontmatter.tags ?? [],
        series: frontmatter.series,
        cover,
        images,
        html
      };
    })
  );

  return galleries
    .filter((gallery): gallery is GalleryEntry => Boolean(gallery))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getGalleryBySlug(slug: string) {
  const galleries = await getAllGalleries();
  return galleries.find((gallery) => gallery.slug === slug);
}

export async function getAllPosts() {
  const slugs = await readDirectoryNames(path.join(contentRoot, "posts"));
  const posts = await Promise.all(
    slugs.map(async (slug): Promise<PostEntry | null> => {
      const { frontmatter, html, imagesMeta } = await readContentFile<PostFrontmatter>("posts", slug);
      if (!assertPublished(frontmatter.published)) {
        return null;
      }

      const images = await resolveImages("posts", slug, imagesMeta);
      const cover = frontmatter.cover
        ? images.find((image) => image.id.endsWith(`/${frontmatter.cover}`))
        : images[0];

      return {
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        dateLabel: formatDate(frontmatter.date),
        summary: frontmatter.summary,
        tags: frontmatter.tags ?? [],
        cover,
        images,
        html,
        relatedGalleries: frontmatter.relatedGalleries ?? []
      };
    })
  );

  return posts.filter((post): post is PostEntry => Boolean(post)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getAllTags() {
  const [galleries, posts] = await Promise.all([getAllGalleries(), getAllPosts()]);
  return Array.from(new Set([...galleries.flatMap((item) => item.tags), ...posts.flatMap((item) => item.tags)])).sort();
}
