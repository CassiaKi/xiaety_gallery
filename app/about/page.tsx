const douyinUrl = "https://v.douyin.com/MxY5sQeNNFQ/";

export const metadata = {
  title: "关于"
};

function DouyinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.2 3.25c.48 2.34 1.88 4.28 4.05 5.58v2.7a8.83 8.83 0 0 1-4.2-1.77v5.46a5.87 5.87 0 1 1-5.88-5.85c.34 0 .67.03.99.09v2.82a3.35 3.35 0 1 0 2.37 3.2V3.25h2.67Z"
        fill="currentColor"
      />
      <path
        d="M14.2 3.25c.48 2.34 1.88 4.28 4.05 5.58"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <section className="page-section">
      <div className="about-shell">
        <div className="about-profile">
          <div className="section-label">About</div>
          <div className="about-profile__body">
            <div className="about-intro">
              <img src="/avatar.jpg" alt="个人头像" width={88} height={88} className="about-avatar" />
              <div className="about-intro__copy">
                <h1 className="page-title">关于我</h1>
                <p className="lead">
                  这里记录我整理图片、归档日常片段和发布博客的过程，也把它当作一张持续更新的个人作品名片。
                </p>
              </div>
            </div>

            <a className="about-social" href={douyinUrl} target="_blank" rel="noreferrer">
              <span className="about-social__icon">
                <DouyinIcon />
              </span>
              <span className="about-social__text">
                <strong>抖音主页</strong>
                <span>打开我的抖音分享链接</span>
              </span>
            </a>
          </div>
        </div>

        <div className="article-shell">
          <div className="section-label">Notes</div>
          <div className="article-body">
            <p>
              这个站点主要用来整理个人图库和随手写下的文字。图片会在构建时自动生成缩略图和预览图，
              这样在手机和桌面端浏览都会更轻一些。
            </p>
            <p>
              现在的发布流程也尽量做了简化：新增图库时，把图片放进对应目录就能生成页面；
              写普通博客时，直接放一个 Markdown 文件就能发布。
            </p>
            <p>如果你想查看更多日常更新，也可以通过上面的抖音入口找到我。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
