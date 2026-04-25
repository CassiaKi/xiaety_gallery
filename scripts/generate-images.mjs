import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const contentRoot = path.join(process.cwd(), "content");
const outputRoot = path.join(process.cwd(), "public", "generated");
const manifestPath = path.join(outputRoot, "image-manifest.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

async function ensureCleanOutput() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });
}

async function directoryExists(target) {
  try {
    const stat = await fs.stat(target);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function readDirectories(target) {
  if (!(await directoryExists(target))) {
    return [];
  }

  const entries = await fs.readdir(target, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function listImageFiles(imagesDir) {
  if (!(await directoryExists(imagesDir))) {
    return [];
  }

  const entries = await fs.readdir(imagesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

async function generateVariants({ inputPath, outputDir, outputStem }) {
  const baseImage = sharp(inputPath, { failOn: "none" });
  const metadata = await baseImage.metadata();

  const thumbPath = path.join(outputDir, `${outputStem}-thumb.webp`);
  const viewerPath = path.join(outputDir, `${outputStem}-viewer.webp`);
  const previewPath = path.join(outputDir, `${outputStem}-preview.webp`);
  const fullPath = path.join(outputDir, `${outputStem}${path.extname(inputPath)}`);

  const thumbWidth = Math.min(metadata.width ?? 480, 480);
  const viewerWidth = Math.min(metadata.width ?? 960, 960);
  const previewWidth = Math.min(metadata.width ?? 1600, 1600);
  const blurBuffer = await baseImage.resize(24).webp({ quality: 45 }).toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  await sharp(inputPath, { failOn: "none" })
    .resize({ width: thumbWidth, withoutEnlargement: true })
    .webp({ quality: 66 })
    .toFile(thumbPath);

  await sharp(inputPath, { failOn: "none" })
    .resize({ width: viewerWidth, withoutEnlargement: true })
    .webp({ quality: 74 })
    .toFile(viewerPath);

  await sharp(inputPath, { failOn: "none" })
    .resize({ width: previewWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(previewPath);

  await fs.copyFile(inputPath, fullPath);

  const [thumbStat, viewerStat, previewStat, fullStat, thumbMeta, viewerMeta, previewMeta] = await Promise.all([
    fs.stat(thumbPath),
    fs.stat(viewerPath),
    fs.stat(previewPath),
    fs.stat(fullPath),
    sharp(thumbPath).metadata(),
    sharp(viewerPath).metadata(),
    sharp(previewPath).metadata()
  ]);

  return {
    width: metadata.width ?? previewMeta.width ?? thumbMeta.width ?? 0,
    height: metadata.height ?? previewMeta.height ?? thumbMeta.height ?? 0,
    blurDataURL,
    thumb: {
      src: `/${path.relative(path.join(process.cwd(), "public"), thumbPath).replaceAll("\\", "/")}`,
      width: thumbMeta.width ?? thumbWidth,
      height: thumbMeta.height ?? metadata.height ?? 0,
      bytes: thumbStat.size
    },
    viewer: {
      src: `/${path.relative(path.join(process.cwd(), "public"), viewerPath).replaceAll("\\", "/")}`,
      width: viewerMeta.width ?? viewerWidth,
      height: viewerMeta.height ?? metadata.height ?? 0,
      bytes: viewerStat.size
    },
    preview: {
      src: `/${path.relative(path.join(process.cwd(), "public"), previewPath).replaceAll("\\", "/")}`,
      width: previewMeta.width ?? previewWidth,
      height: previewMeta.height ?? metadata.height ?? 0,
      bytes: previewStat.size
    },
    full: {
      src: `/${path.relative(path.join(process.cwd(), "public"), fullPath).replaceAll("\\", "/")}`,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      bytes: fullStat.size
    }
  };
}

async function processPhotos() {
  const sourceDir = path.join(contentRoot, "photos");
  const outputDir = path.join(outputRoot, "photos");
  const files = await listImageFiles(sourceDir);

  if (!files.length) {
    return {};
  }

  await fs.mkdir(outputDir, { recursive: true });
  const manifestEntries = {};

  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const outputStem = path.parse(file).name;
    const variants = await generateVariants({ inputPath, outputDir, outputStem });

    manifestEntries[`photos/${file}`] = {
      id: `photos/${file}`,
      alt: file,
      caption: undefined,
      ...variants
    };
  }

  return manifestEntries;
}

async function loadPostImagesMeta(slug) {
  const imagesPath = path.join(contentRoot, "posts", slug, "images.json");
  if (await fs.access(imagesPath).then(() => true).catch(() => false)) {
    const raw = await fs.readFile(imagesPath, "utf8");
    return JSON.parse(raw);
  }

  const files = await listImageFiles(path.join(contentRoot, "posts", slug, "images"));
  return files.map((file) => ({ file }));
}

async function processPosts() {
  const manifestEntries = {};
  const slugs = await readDirectories(path.join(contentRoot, "posts"));

  for (const slug of slugs) {
    const imagesMeta = await loadPostImagesMeta(slug);
    const sourceDir = path.join(contentRoot, "posts", slug, "images");
    if (!(await directoryExists(sourceDir))) {
      continue;
    }

    const outputDir = path.join(outputRoot, "posts", slug);
    await fs.mkdir(outputDir, { recursive: true });

    for (const image of imagesMeta) {
      const inputPath = path.join(sourceDir, image.file);
      const outputStem = path.parse(image.file).name;
      const variants = await generateVariants({ inputPath, outputDir, outputStem });

      manifestEntries[`posts/${slug}/${image.file}`] = {
        id: `posts/${slug}/${image.file}`,
        alt: image.alt,
        caption: image.caption,
        ...variants
      };
    }
  }

  return manifestEntries;
}

async function main() {
  await ensureCleanOutput();
  const [photos, posts] = await Promise.all([processPhotos(), processPosts()]);

  await fs.writeFile(manifestPath, JSON.stringify({ ...photos, ...posts }, null, 2), "utf8");
  console.log(`Generated image manifest at ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
