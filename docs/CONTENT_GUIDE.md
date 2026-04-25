# 内容管理说明

## 图片发布

所有源图片放在：

`content/photos/`

例如：

```text
content/photos/
  city-001.jpg
  city-002.jpg
  bridge-001.jpg
```

站点会自动：

- 读取这个目录里的全部图片
- 生成缩略图、预览图和原图下载资源
- 按文件名前缀自动分组排序

例如：

- `bridge-*` 会排在一起
- `city-*` 会排在一起

每组内部再按文件修改时间倒序。

## 图片置顶

如果你想把某些图片放到最前面，不需要复制原图。

你只要在：

`content/pinned/`

里创建一个很小的标记文件，文件名写成：

`原图片文件名.pin`

例如你想置顶：

- `city-001.jpg`
- `bridge-003.jpg`

那么就在 `content/pinned/` 里放：

```text
content/pinned/
  city-001.jpg.pin
  bridge-003.jpg.pin
```

系统会根据这些 `.pin` 文件，把 `content/photos/` 里对应的图片排到最前面。

注意：

- `content/pinned/` 里放的是很小的标记文件，不是图片本体
- 页面真正展示的仍然是 `content/photos/` 里的原图
- 如果 `.pin` 文件名和原图文件名对不上，就不会生效
- 多张置顶图之间，会按这些 `.pin` 文件的修改时间倒序排列

## 博客发布

博客文章放在：

`content/posts/`

最简单的方式是直接新增一个 Markdown 文件：

```text
content/posts/my-note.md
```

## 本地预览

```bash
npm run dev
```

## 正式发布

```bash
git add .
git commit -m "auto update"
git push
```
