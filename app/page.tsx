import Link from "next/link";
import { GalleryCard } from "@/components/gallery-card";
import { PostCard } from "@/components/post-card";
import { getAllGalleries, getAllPosts } from "@/lib/content";

export default async function HomePage() {
  const [galleries, posts] = await Promise.all([getAllGalleries(), getAllPosts()]);
  const featured = galleries.slice(0, 3);
  const latestPosts = posts.slice(0, 2);
  const heroGallery = galleries[0];

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <div className="eyebrow">Static gallery journal</div>
          <h1>{heroGallery?.title ?? "Visual Diary"}</h1>
          <p>
            为偏重图片浏览的个人站点而做的轻量结构。首页只加载缩略图，详情默认加载中等预览图，
            需要看细节时再打开原图，兼顾静态部署速度与观感。
          </p>
          <div className="hero__actions">
            <Link href="/gallery" className="button">
              浏览图库
            </Link>
            <Link href="/blog" className="ghost-button">
              阅读日志
            </Link>
          </div>
        </div>
        {heroGallery ? (
          <Link href={`/gallery/${heroGallery.slug}`} className="hero__visual card">
            <div
              className="card__image"
              style={{
                aspectRatio: `${heroGallery.cover.thumb.width} / ${heroGallery.cover.thumb.height}`
              }}
            >
              <img
                src={heroGallery.cover.thumb.src}
                alt={heroGallery.cover.alt}
                width={heroGallery.cover.thumb.width}
                height={heroGallery.cover.thumb.height}
              />
            </div>
            <div className="card__body">
              <div className="card__meta">{heroGallery.dateLabel}</div>
              <h2>{heroGallery.title}</h2>
              <p className="card__summary">{heroGallery.summary}</p>
              <div className="tag-row">
                {heroGallery.tags.map((tag) => (
                  <span className="tag-pill" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      <section className="page-section">
        <div className="section-head">
          <div>
            <div className="section-label">Featured galleries</div>
            <h2>精选作品</h2>
          </div>
          <Link href="/gallery" className="ghost-button">
            查看全部
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((gallery) => (
            <GalleryCard key={gallery.slug} gallery={gallery} />
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-head">
          <div>
            <div className="section-label">Field notes</div>
            <h2>最近文章</h2>
          </div>
          <Link href="/blog" className="ghost-button">
            查看博客
          </Link>
        </div>
        <div className="grid-2">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
