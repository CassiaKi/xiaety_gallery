# Xiaety Gallery

一个可静态部署的个人图库博客模板，基于 `Next.js static export`，并带有构建期图片处理。

## 本地开发

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
```

构建流程会先执行 `scripts/generate-images.mjs`，为内容目录中的源图片生成三层资源：

- `thumb`：列表页和卡片页使用
- `preview`：详情页默认使用
- `full`：用户点击灯箱后按需加载

构建完成后：

- 静态站输出目录：`out/`
- 图片清单：`public/generated/image-manifest.json`

## 最简单的发布方式

详细教学文档见：[docs/CONTENT_GUIDE.md](./docs/CONTENT_GUIDE.md)

### 发图库

最简单时，你只需要新建一个目录并把图片丢进去：

```text
content/
  galleries/
    my-trip/
      images/
        001.jpg
        002.jpg
        003.jpg
```

现在 `index.md` 和 `images.json` 都是可选的：

- 没有 `index.md`：系统会自动用目录名生成标题，并给出默认摘要
- 没有 `images.json`：系统会自动按文件名顺序读取图片

如果你想后面再细调，再补这两个文件就行。

### 发博客

最简单时，直接新建一个 Markdown 文件：

```text
content/
  posts/
    my-note.md
```

例子：

```md
---
title: 一篇新随记
date: 2026-04-24
summary: 记录今天拍照和整理图库时的一些想法。
tags:
  - notes
  - workflow
published: true
---

今天把一组旧图整理进了站点里，也顺手把浏览和发布流程简化了一遍。
```

如果你需要文章带图片，也仍然可以继续用原来的目录结构：

```text
content/posts/my-post/
  index.md
  images.json
  images/
```

## 完整内容结构

```text
content/
  galleries/
    your-gallery/
      index.md        # 可选
      images.json     # 可选
      images/
  posts/
    your-post.md      # 最简单的博客写法
    rich-post/
      index.md
      images.json
      images/
```

## Cloudflare Pages 部署

这个仓库已经包含 Pages 所需的基础配置：

- `next.config.mjs`
  - `output: "export"`，生成纯静态站
  - `trailingSlash: true`，导出目录式路由，适合静态托管
- `wrangler.toml`
  - `pages_build_output_dir = "./out"`
- `public/_headers`
  - 为 `/_next/static/*` 设置长期缓存
  - 为 `/generated/*` 设置较温和的浏览器缓存

### 方式一：Cloudflare Dashboard + Git 集成

1. 把仓库推到 GitHub。
2. 打开 Cloudflare 的 Workers & Pages。
3. 选择 `Create application` -> `Pages` -> `Import an existing Git repository`。
4. 选择这个仓库。
5. 构建设置使用以下值：

```text
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
```

如果界面里已经自动识别出 `Next.js (Static HTML Export)`，保留即可。

### 方式二：Wrangler 直接上传

先登录 Cloudflare：

```bash
npx wrangler login
```

首次创建并上传：

```bash
npm run build
npx wrangler pages deploy out
```

如果需要预览分支部署：

```bash
npx wrangler pages deploy out --branch preview
```

## 上线前需要改的地方

- 把 `lib/site.ts` 里的 `url` 改成你的正式域名或 Pages 子域名
- 如果你要用自己的 Pages 项目名，可以同步修改 `wrangler.toml` 中的 `name`

## 参考

- Cloudflare 官方的静态 Next.js Pages 指南说明，`Next.js (Static HTML Export)` 的默认构建命令是 `npx next build`，输出目录是 `out`。
- Cloudflare 官方的 `_headers` 文档说明，可以把 `_headers` 放在 `public/` 里，构建后会跟随静态资源一起部署。
- Cloudflare 官方的 Wrangler 配置文档说明，Pages 项目可通过 `pages_build_output_dir` 在 `wrangler.toml` 中声明输出目录。

## GitHub Pages 部署

仓库已经包含自动部署工作流：

- `.github/workflows/deploy-pages.yml`

### 启用方式

1. 打开 GitHub 仓库的 `Settings`。
2. 进入 `Pages`。
3. 在 `Build and deployment` 中把 `Source` 设为 `GitHub Actions`。
4. 保持默认分支为 `main`，后续每次 `git push` 都会自动触发构建和部署。

### 访问地址

这个仓库是项目仓库，因此默认地址会是：

```text
https://cassiaki.github.io/xiaety_gallery/
```

项目里已经针对 GitHub Pages 做了路径适配：

- 在 GitHub Actions 构建时自动启用 `basePath: "/xiaety_gallery"`
- 静态资源会挂到 `/xiaety_gallery/` 前缀下
