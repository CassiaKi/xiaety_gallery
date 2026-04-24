export const metadata = {
  title: "关于"
};

export default function AboutPage() {
  return (
    <section className="page-section">
      <div className="article-shell">
        <div className="section-label">About</div>
        <h1 className="page-title">关于这个站</h1>
        <div className="article-body">
          <p>
            这是一个适合静态部署的个人图库博客模板。内容通过 Git 管理，构建时自动生成缩略图、预览图和原图索引。
          </p>
          <p>
            日常发布流程只需要新增图库目录或文章目录，然后执行一次构建。站点不会依赖数据库、运行时图像服务或后台接口。
          </p>
          <p>
            如果你想接着扩展，可以继续加入归档页、设备页、系列页，或者再挂上 Cloudflare Pages / GitHub Pages 做自动部署。
          </p>
        </div>
      </div>
    </section>
  );
}
