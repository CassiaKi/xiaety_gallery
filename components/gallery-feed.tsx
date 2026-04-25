"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryFeedImage, GalleryFeedSection } from "@/lib/content";

type Props = {
  sections: GalleryFeedSection[];
};

export function GalleryFeed({ sections }: Props) {
  const images = useMemo(() => sections.flatMap((section) => section.images), [sections]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const candidates = [images[activeIndex - 1], images[activeIndex + 1]].filter(
      Boolean
    ) as GalleryFeedImage[];

    for (const image of candidates) {
      const preload = new Image();
      preload.src = image.viewer.src;
    }
  }, [activeIndex, images]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? current : (current + 1) % images.length));
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + images.length) % images.length
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  const currentLabel = useMemo(() => {
    if (activeIndex === null) {
      return "";
    }

    return `${activeIndex + 1} / ${images.length}`;
  }, [activeIndex, images.length]);

  let imageCursor = -1;

  return (
    <>
      <div className="feed-shell">
        {sections.map((section) => (
          <section key={section.key} className="feed-section">
            <div className="feed-section__head">
              <span className="feed-section__label">{section.label}</span>
            </div>

            <div className="image-masonry">
              {section.images.map((image) => {
                imageCursor += 1;
                const currentIndex = imageCursor;

                return (
                  <button
                    key={image.id}
                    type="button"
                    className="image-masonry__item"
                    onClick={() => setActiveIndex(currentIndex)}
                    aria-label={`查看图片 ${image.alt}`}
                  >
                    <span
                      className="image-masonry__frame"
                      style={{ aspectRatio: `${image.thumb.width} / ${image.thumb.height}` }}
                    >
                      <img
                        src={image.thumb.src}
                        alt={image.alt}
                        width={image.thumb.width}
                        height={image.thumb.height}
                        loading="lazy"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {activeImage ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="图片查看"
          onClick={() => setActiveIndex(null)}
        >
          <div className="lightbox__chrome" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox__topbar">
              <div>
                <strong>{activeImage.groupLabel}</strong>
                <div className="lightbox__hint">{currentLabel}</div>
              </div>
              <button type="button" className="ghost-button" onClick={() => setActiveIndex(null)}>
                关闭
              </button>
            </div>

            <div className="lightbox__viewer">
              <img
                className="lightbox__display"
                src={activeImage.viewer.src}
                alt={activeImage.alt}
                width={activeImage.viewer.width}
                height={activeImage.viewer.height}
              />
            </div>

            <div className="lightbox__nav">
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null ? 0 : (current - 1 + images.length) % images.length
                  )
                }
              >
                上一张
              </button>

              <div className="lightbox__hint">{activeImage.alt}</div>

              <div className="lightbox__actions">
                <a className="ghost-button" href={activeImage.full.src} download>
                  下载原图
                </a>
                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === null ? 0 : (current + 1) % images.length
                    )
                  }
                >
                  下一张
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
