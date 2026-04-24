import { promises as fs } from "fs";
import path from "path";

const sourceRoot = process.argv[2] ?? "F:\\SNOY\\my_gallery\\gallery";
const projectRoot = process.cwd();
const contentGalleriesRoot = path.join(projectRoot, "content", "galleries");
const videoImportRoot = path.join(projectRoot, "public", "imported-video");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v"]);

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "gallery";
}

function titleFromName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function chooseCover(files) {
  const preferred = files.find((file) => /cover|cov/i.test(file));
  return preferred ?? files[0];
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function clearDir(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
  await ensureDir(targetPath);
}

async function listFiles(targetPath) {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

async function listDirectories(targetPath) {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function statDate(targetPath) {
  const stat = await fs.stat(targetPath);
  return stat.mtime.toISOString().slice(0, 10);
}

async function copyFiles(sourceDir, targetDir, files) {
  await ensureDir(targetDir);
  await Promise.all(
    files.map((file) =>
      fs.copyFile(path.join(sourceDir, file), path.join(targetDir, file))
    )
  );
}

async function writeGallery({ slug, title, date, summary, tags, cover, files, sourceDir }) {
  const galleryDir = path.join(contentGalleriesRoot, slug);
  const imagesDir = path.join(galleryDir, "images");

  await clearDir(galleryDir);
  await copyFiles(sourceDir, imagesDir, files);

  const markdown = `---
title: ${title}
date: ${date}
summary: ${summary}
tags:
  - imported
  - ${slug}
series: Legacy Archive
cover: ${cover}
published: true
---

从旧图库目录导入的一组图片，保留了原始文件名与顺序。

这组内容由导入脚本生成，你可以继续修改这里的标题、摘要、标签和正文说明。
`;

  const imagesMeta = files.map((file, index) => ({
    file,
    alt: `${title} ${index + 1}`,
    caption: `Imported from ${path.basename(sourceDir)}`
  }));

  await Promise.all([
    fs.writeFile(path.join(galleryDir, "index.md"), markdown, "utf8"),
    fs.writeFile(path.join(galleryDir, "images.json"), `${JSON.stringify(imagesMeta, null, 2)}\n`, "utf8")
  ]);
}

async function importFolderGallery(sourceDir, folderName) {
  const allFiles = (await listFiles(sourceDir))
    .filter((file) => file !== ".gitkeep")
    .sort((a, b) => a.localeCompare(b, "en"));

  const imageFiles = allFiles.filter((file) => imageExtensions.has(path.extname(file).toLowerCase()));
  if (!imageFiles.length) {
    return null;
  }

  const title = titleFromName(folderName);
  const slug = slugify(folderName);
  const cover = chooseCover(imageFiles);
  const date = await statDate(sourceDir);

  await writeGallery({
    slug,
    title,
    date,
    summary: `Imported from the legacy ${title} gallery.`,
    tags: ["imported", slug],
    cover,
    files: imageFiles,
    sourceDir
  });

  return slug;
}

async function importRootLooseImages() {
  const allFiles = (await listFiles(sourceRoot))
    .filter((file) => file !== ".gitkeep")
    .sort((a, b) => a.localeCompare(b, "en"));

  const imageFiles = allFiles.filter((file) => imageExtensions.has(path.extname(file).toLowerCase()));
  if (!imageFiles.length) {
    return null;
  }

  await writeGallery({
    slug: "legacy-misc",
    title: "Legacy Misc",
    date: await statDate(sourceRoot),
    summary: "Loose images imported from the root of the legacy gallery folder.",
    tags: ["imported", "misc"],
    cover: chooseCover(imageFiles),
    files: imageFiles,
    sourceDir: sourceRoot
  });

  return "legacy-misc";
}

async function importVideos() {
  const videoSourceDir = path.join(sourceRoot, "Video");
  const entries = await listFiles(videoSourceDir).catch(() => []);
  const videos = entries
    .filter((file) => file !== ".gitkeep")
    .filter((file) => videoExtensions.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (!videos.length) {
    return [];
  }

  await clearDir(videoImportRoot);
  await copyFiles(videoSourceDir, videoImportRoot, videos);
  return videos;
}

async function main() {
  const folders = await listDirectories(sourceRoot);
  const imported = [];

  for (const folderName of folders) {
    if (folderName === "Video") {
      continue;
    }

    const slug = await importFolderGallery(path.join(sourceRoot, folderName), folderName);
    if (slug) {
      imported.push(slug);
    }
  }

  const miscSlug = await importRootLooseImages();
  if (miscSlug) {
    imported.push(miscSlug);
  }

  const videos = await importVideos();

  console.log(`Imported galleries: ${imported.join(", ")}`);
  console.log(`Imported videos: ${videos.join(", ") || "none"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
