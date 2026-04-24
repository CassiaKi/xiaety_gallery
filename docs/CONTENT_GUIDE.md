# 图库和博客管理说明

这份文档专门讲这个站点平时怎么用，重点是：

- 怎么新增一个图库
- 怎么新增一篇博客
- 什么是最简单的发布方式
- 想精细控制时该怎么写

## 一句话理解

这个站点现在已经尽量简化成两种最常用的发布方式：

- 发图库：新建一个目录，把图片放进去
- 发博客：新建一个 Markdown 文件

如果你想进一步控制标题、摘要、标签、封面、图片说明，再补元数据文件就行。

## 目录结构

```text
content/
  galleries/
    your-gallery/
      images/
  posts/
    your-post.md
```

这是最简单的用法。

完整一点时会变成：

```text
content/
  galleries/
    your-gallery/
      index.md
      images.json
      images/
  posts/
    your-post.md
    rich-post/
      index.md
      images.json
      images/
```

## 管理图库

### 最简单方式

假设你要发一组叫“东京散步”的图片，可以直接新建：

```text
content/galleries/tokyo-walk/images/
```

然后把图片丢进去：

```text
content/galleries/tokyo-walk/images/001.jpg
content/galleries/tokyo-walk/images/002.jpg
content/galleries/tokyo-walk/images/003.jpg
```

这样就已经能生成一个图库页面了。

系统会自动帮你做这些事：

- 用目录名 `tokyo-walk` 生成默认标题
- 用文件名顺序排列图片
- 优先找带 `cover` 或 `cov` 的文件做封面
- 如果没有封面命名规则，就默认第一张当封面
- 构建时自动生成缩略图、预览图和原图索引

### 更正式的方式

如果你想让图库标题、摘要、标签更像正式作品集，就补一个：

```text
content/galleries/tokyo-walk/index.md
```

示例：

```md
---
title: 东京散步
date: 2026-04-24
summary: 一组关于街道、灯光和夜色的旅行照片。
tags:
  - tokyo
  - travel
  - street
series: 路途记录
cover: 001.jpg
published: true
---

这里写这组图的说明、拍摄背景、器材、想法或者当天的记录。
```

字段说明：

- `title`: 图库标题
- `date`: 展示日期
- `summary`: 卡片摘要
- `tags`: 标签，会影响标签页
- `series`: 系列名称
- `cover`: 封面文件名，必须和 `images/` 里的文件对应
- `published`: 是否发布，`false` 时不会出现在站点里

### 想控制图片顺序和说明

如果你还想自己指定图片顺序、alt 文本和 caption，就再补一个：

```text
content/galleries/tokyo-walk/images.json
```

示例：

```json
[
  {
    "file": "001.jpg",
    "alt": "东京街头夜景",
    "caption": "雨后的路面把灯光拉成了长线。"
  },
  {
    "file": "002.jpg",
    "alt": "路口与人流",
    "caption": "行人与路灯之间形成了更强的节奏感。"
  },
  {
    "file": "003.jpg",
    "alt": "便利店门口的暖光",
    "caption": "适合作为正文中的单张引用。"
  }
]
```

作用：

- `file`: 图片文件名
- `alt`: 图片替代文本
- `caption`: 图片说明文字

如果没有 `images.json`：

- 图片顺序默认按文件名排序
- `alt` 会自动生成
- `caption` 默认留空

## 管理博客

### 最简单方式

现在最简单的博客写法，是直接在 `content/posts/` 下放一个 Markdown 文件：

```text
content/posts/my-note.md
```

示例：

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

之后如果只想写普通文章，直接这么发就够了。
```

### 带图片的博客

如果这篇文章本身要带一组本地图片，就用目录方式：

```text
content/posts/my-post/
  index.md
  images.json
  images/
```

`index.md` 示例：

```md
---
title: 为图库博客设计一条更轻的图片加载路径
date: 2026-04-24
summary: 记录为什么首页只加载缩略图，而详情页和灯箱按阶段提升图像质量。
tags:
  - gallery
  - performance
cover: note-board.jpg
relatedGalleries:
  - city
  - train
published: true
---

这里写正文。
```

额外字段：

- `cover`: 文章封面图
- `relatedGalleries`: 关联图库的 slug 列表

## 图片是怎么处理的

原始大图不会直接在列表页使用。

构建时会自动生成三层图片：

- `thumb`: 缩略图，给首页、列表页、卡片页使用
- `preview`: 预览图，给详情页默认显示
- `full`: 原图，用户点击后按需加载

所以你平时不需要自己手动压三套图，直接放原图就可以。

## 平时发布流程

### 本地预览

```bash
npm run dev
```

打开本地页面，看看标题、摘要、标签、图片顺序是否正常。

### 正式发布

```bash
git add .
git commit -m "update content"
git push
```

推送后 GitHub Pages 会自动重新构建和发布。

## 最常见的两种使用建议

### 只想轻松发图库

直接记住这一条就够了：

1. 在 `content/galleries/` 下面新建一个目录
2. 在里面建一个 `images/`
3. 把图片丢进去
4. `git push`

### 想让页面更正式

再额外补：

1. `index.md`
2. `images.json`

这样就能控制标题、摘要、标签、封面和图片说明。

## 你现在可以参考的现成示例

图库示例：

- [bridge](F:/SNOY/xiaety_gallery/content/galleries/bridge)
- [building](F:/SNOY/xiaety_gallery/content/galleries/building)
- [city](F:/SNOY/xiaety_gallery/content/galleries/city)

博客示例：

- [building-a-static-photo-journal](F:/SNOY/xiaety_gallery/content/posts/building-a-static-photo-journal)

## 常见问题

### 1. 图片顺序不对怎么办

加一个 `images.json`，按你想要的顺序写。

### 2. 封面不是我想要的那张怎么办

在 `index.md` 里写：

```md
cover: your-cover.jpg
```

### 3. 我不想马上发布怎么办

在 frontmatter 里写：

```md
published: false
```

### 4. 普通博客一定要建目录吗

不用。普通文章现在直接写一个 `.md` 文件就行。

### 5. 图片一定要自己压缩吗

不用。构建时会自动生成缩略图和预览图。
