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

type GalleryFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  series?: string;
  cover?: string;
  published?: boolean;
};

type PostFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
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
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

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

async function readDirectoryNames(targetPath: string) {
  const exists = await pathExists(targetPath);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
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

async function listImageFiles(imagesDir: string) {
  if (!(await pathExists(imagesDir))) {
    return [];
  }

  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

function chooseCover(files: string[]) {
  return files.find((file) => /cover|cov/i.test(file)) ?? files[0];
}

async function loadImagesMeta(baseDir: "galleries" | "posts", slug: string) {
  const imagesDir = path.join(contentRoot, baseDir, slug, "images");
  const imagesPath = path.join(contentRoot, baseDir, slug, "images.json");

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

async function readGalleryContent(slug: string) {
  const folderPath = path.join(contentRoot, "galleries", slug);
  const markdownPath = path.join(folderPath, "index.md");
  const folderStat = await fs.stat(folderPath);

  const frontmatter: GalleryFrontmatter = {};
  let html = "";

  if (await pathExists(markdownPath)) {
    const markdownRaw = await fs.readFile(markdownPath, "utf8");
    const parsed = matter(markdownRaw);
    Object.assign(frontmatter, parsed.data as GalleryFrontmatter);
    html = await renderMarkdown(parsed.content);
  }

  const imagesMeta = await loadImagesMeta("galleries", slug);
  return {
    frontmatter,
    html,
    imagesMeta,
    defaultDate: folderStat.mtime.toISOString().slice(0, 10)
  };
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
    imagesMeta: await loadImagesMeta("posts", slug),
    defaultDate: folderStat.mtime.toISOString().slice(0, 10)
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

  return imagesMeta.map((image, index) => {
    const key = `${collection}/${slug}/${image.file}`;
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

function assertPublished(flag: boolean | undefined) {
  return flag !== false;
}

export async function getAllGalleries() {
  const slugs = await readDirectoryNames(path.join(contentRoot, "galleries"));
  const galleries = await Promise.all(
    slugs.map(async (slug): Promise<GalleryEntry | null> => {
      const { frontmatter, html, imagesMeta, defaultDate } = await readGalleryContent(slug);
      if (!assertPublished(frontmatter.published)) {
        return null;
      }

      const images = await resolveImages("galleries", slug, imagesMeta);
      if (!images.length) {
        return null;
      }

      const coverFile = frontmatter.cover ?? chooseCover(imagesMeta.map((image) => image.file));
      const cover = images.find((image) => image.id.endsWith(`/${coverFile}`));
      if (!cover) {
        throw new Error(`Cover image "${coverFile}" not found for gallery "${slug}"`);
      }

      const date = frontmatter.date ?? defaultDate;

      return {
        slug,
        title: frontmatter.title ?? startCase(slug),
        date,
        dateLabel: formatDate(date),
        summary: frontmatter.summary ?? "一组新导入的图片，等待补充更完整的标题与说明。",
        tags: frontmatter.tags ?? [slug],
        series: frontmatter.series ?? "图像归档",
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
  const entries = await readPostEntries();
  const posts = await Promise.all(
    entries.map(async ({ slug, kind }): Promise<PostEntry | null> => {
      const { frontmatter, html, imagesMeta, defaultDate } = await readPostContent(slug, kind);
      if (!assertPublished(frontmatter.published)) {
        return null;
      }

      const images = kind === "directory" ? await resolveImages("posts", slug, imagesMeta) : [];
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
