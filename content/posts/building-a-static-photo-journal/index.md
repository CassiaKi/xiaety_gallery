---
title: 为图库博客设计一条更轻的图片加载路径
date: 2026-04-01
summary: 记录为什么首页只加载缩略图，而详情页和灯箱按阶段提升图像质量。
tags:
  - workflow
  - gallery
  - performance
cover: note-board.svg
relatedGalleries:
  - city-after-rain
  - quiet-morning
published: true
---

如果源文件很大，最影响体验的并不是“用户最终能不能看到原图”，而是“首屏是不是被大量图片阻塞了”。

所以这里把图片拆成三层：

- 缩略图：只负责列表页和卡片页的浏览效率
- 预览图：负责详情页里的主要阅读体验
- 原图：只在用户明确表达要看细节时再加载

这套方式尤其适合静态站，因为图片派生过程完全发生在构建期，不需要运行时处理服务。
