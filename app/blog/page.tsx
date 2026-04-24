import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";

export const metadata = {
  title: "博客"
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <section className="page-section">
      <div className="panel">
        <div className="section-label">Journal</div>
        <h1 className="page-title">博客</h1>
        <p className="lead">文章页可挂接作品、封面和附图，但默认仍以压缩预览图呈现，不直接下载大图。</p>
      </div>
      <div className="grid-2" style={{ marginTop: 22 }}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
