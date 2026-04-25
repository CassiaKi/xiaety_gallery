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
  alt?: string;
  caption?: string;
};

type PostFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  cover?: string;
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

export type GalleryFeedImage = {
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

const contentRoot = path.join(process.cwd(), "content");
const generatedManifestPath = path.join(process.cwd(), "public", "generated", "image-manifest.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const photosRoot = path.join(contentRoot, "photos");
const pinnedRoot = path.join(contentRoot, "pinned");
const pinExtension = ".pin";

let manifestCache: Record<string, ImageManifestItem> | null = null;

function startCase(input: string) {
  return input
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

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

async function listImageFiles(targetPath: string) {
  const exists = await pathExists(targetPath);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const files = await Promise.all(
    entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(async (entry) => {
        const filePath = path.join(targetPath, entry.name);
        const stat = await fs.stat(filePath);
        return {
          name: entry.name,
          mtimeMs: stat.mtimeMs
        };
      })
  );

  return files.sort((a, b) => b.mtimeMs - a.mtimeMs).map((file) => file.name);
}

function getImageGroupName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const [groupName] = baseName.split("-");
  return groupName?.trim().toLowerCase() || "other";
}

async function listPinnedMarkers(targetPath: string) {
  const exists = await pathExists(targetPath);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const markers = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(pinExtension))
      .map(async (entry) => {
        const filePath = path.join(targetPath, entry.name);
        const stat = await fs.stat(filePath);
        return {
          name: entry.name.slice(0, -pinExtension.length),
          mtimeMs: stat.mtimeMs
        };
      })
  );

  return markers.sort((a, b) => b.mtimeMs - a.mtimeMs).map((marker) => marker.name);
}

async function listPhotoFiles(targetPath: string) {
  const exists = await pathExists(targetPath);
  if (!exists) {
    return [];
  }

  const pinnedFiles = await listPinnedMarkers(pinnedRoot);
  const pinnedOrder = new Map(
    pinnedFiles.map((fileName, index) => [fileName, index])
  );

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(async (entry) => {
        const filePath = path.join(targetPath, entry.name);
        const stat = await fs.stat(filePath);
        return {
          name: entry.name,
          group: getImageGroupName(entry.name),
          mtimeMs: stat.mtimeMs
        };
      })
  );

  return files
    .sort((a, b) => {
      const aPinned = pinnedOrder.get(a.name);
      const bPinned = pinnedOrder.get(b.name);

      if (aPinned !== undefined || bPinned !== undefined) {
        if (aPinned === undefined) {
          return 1;
        }

        if (bPinned === undefined) {
          return -1;
        }

        if (aPinned !== bPinned) {
          return aPinned - bPinned;
        }
      }

      const groupCompare = a.group.localeCompare(b.group, "en");
      if (groupCompare !== 0) {
        return groupCompare;
      }

      if (a.mtimeMs !== b.mtimeMs) {
        return b.mtimeMs - a.mtimeMs;
      }

      return a.name.localeCompare(b.name, "en");
    })
    .map((file) => file.name);
}

async function readPostEntries() {
  const postsRoot = path.join(contentRoot, "posts");
  const exists = await pathExists(postsRoot);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(postsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() || (entry.isFile() && entry.name.endsWith(".md")))
    .map((entry) => ({
      slug: entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/, ""),
      kind: (entry.isDirectory() ? "directory" : "file") as "directory" | "file"
    }));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}

async function readPhotosMeta() {
  const files = await listPhotoFiles(photosRoot);
  return files.map((file, index) => ({
    file,
    alt: `${startCase(file)} ${index + 1}`,
    caption: undefined
  }));
}

async function resolvePhotoImages(imagesMeta: RawImageMeta[]) {
  const manifest = await readManifest();

  return imagesMeta.map((image, index) => {
    const key = `photos/${image.file}`;
    const generated = manifest[key];
    if (!generated) {
      throw new Error(`Generated image metadata not found for ${key}`);
    }

    return {
      ...generated,
      alt: image.alt ?? `${startCase(image.file)} ${index + 1}`,
      caption: image.caption
    };
  });
}

function assertPublished(flag: boolean | undefined) {
  return flag !== false;
}

export async function getAllGalleries() {
  const imagesMeta = await readPhotosMeta();
  const images = await resolvePhotoImages(imagesMeta);

  if (!images.length) {
    return [];
  }

  const stat = await fs.stat(photosRoot);
  const date = stat.mtime.toISOString().slice(0, 10);

  const gallery: GalleryEntry = {
    slug: "all",
    title: "All Photos",
    date,
    dateLabel: formatDate(date),
    summary: "",
    tags: [],
    cover: images[0],
    images,
    html: ""
  };

  return [gallery];
}

export async function getGalleryBySlug(slug: string) {
  if (slug !== "all") {
    return undefined;
  }

  const galleries = await getAllGalleries();
  return galleries[0];
}

export async function getAllGalleryImages() {
  const imagesMeta = await readPhotosMeta();
  const images = await resolvePhotoImages(imagesMeta);

  return images.map(
    (image): GalleryFeedImage => ({
      id: image.id,
      alt: image.alt,
      caption: image.caption,
      width: image.width,
      height: image.height,
      blurDataURL: image.blurDataURL,
      thumb: image.thumb,
      preview: image.preview,
      full: image.full
    })
  );
}

async function loadPostImagesMeta(slug: string) {
  const imagesDir = path.join(contentRoot, "posts", slug, "images");
  const imagesPath = path.join(contentRoot, "posts", slug, "images.json");

  if (await pathExists(imagesPath)) {
    const raw = await fs.readFile(imagesPath, "utf8");
    return JSON.parse(raw) as RawImageMeta[];
  }

  const files = await listImageFiles(imagesDir);
  return files.map((file, index) => ({
    file,
    alt: `${startCase(slug)} ${index + 1}`,
    caption: undefined
  }));
}

async function resolvePostImages(slug: string, imagesMeta: RawImageMeta[]) {
  const manifest = await readManifest();

  return imagesMeta.map((image, index) => {
    const key = `posts/${slug}/${image.file}`;
    const generated = manifest[key];
    if (!generated) {
      throw new Error(`Generated image metadata not found for ${key}`);
    }

    return {
      ...generated,
      alt: image.alt ?? `${startCase(slug)} ${index + 1}`,
      caption: image.caption
    };
  });
}

async function readPostContent(slug: string, kind: "directory" | "file") {
  if (kind === "file") {
    const markdownPath = path.join(contentRoot, "posts", `${slug}.md`);
    const raw = await fs.readFile(markdownPath, "utf8");
    const stat = await fs.stat(markdownPath);
    const parsed = matter(raw);

    return {
      frontmatter: parsed.data as PostFrontmatter,
      html: await renderMarkdown(parsed.content),
      imagesMeta: [] as RawImageMeta[],
      defaultDate: stat.mtime.toISOString().slice(0, 10)
    };
  }

  const folderPath = path.join(contentRoot, "posts", slug);
  const markdownPath = path.join(folderPath, "index.md");
  const folderStat = await fs.stat(folderPath);
  const raw = await fs.readFile(markdownPath, "utf8");
  const parsed = matter(raw);

  return {
    frontmatter: parsed.data as PostFrontmatter,
    html: await renderMarkdown(parsed.content),
    imagesMeta: await loadPostImagesMeta(slug),
    defaultDate: folderStat.mtime.toISOString().slice(0, 10)
  };
}

export async function getAllPosts() {
  const entries = await readPostEntries();
  const posts = await Promise.all(
    entries.map(async ({ slug, kind }): Promise<PostEntry | null> => {
      const { frontmatter, html, imagesMeta, defaultDate } = await readPostContent(slug, kind);
      if (!assertPublished(frontmatter.published)) {
        return null;
      }

      const images = kind === "directory" ? await resolvePostImages(slug, imagesMeta) : [];
      const cover = frontmatter.cover
        ? images.find((image) => image.id.endsWith(`/${frontmatter.cover}`))
        : images[0];
      const date = frontmatter.date ?? defaultDate;

      return {
        slug,
        title: frontmatter.title ?? startCase(slug),
        date,
        dateLabel: formatDate(date),
        summary: frontmatter.summary ?? "一篇新的博客草稿，等待补充摘要。",
        tags: frontmatter.tags ?? ["notes"],
        cover,
        images,
        html,
        relatedGalleries: []
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
  const posts = await getAllPosts();
  return Array.from(new Set(posts.flatMap((item) => item.tags))).sort();
}
