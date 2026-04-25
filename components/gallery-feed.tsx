"use client";

import { useEffect, useMemo, useState } from "react";
import type { GalleryFeedImage } from "@/lib/content";

type Props = {
  images: GalleryFeedImage[];
};

export function GalleryFeed({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fullReady, setFullReady] = useState(false);

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
      preload.src = image.full.src;
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
        setFullReady(false);
        setActiveIndex((current) => (current === null ? current : (current + 1) % images.length));
      }

      if (event.key === "ArrowLeft") {
        setFullReady(false);
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

  return (
    <>
      <section className="feed-shell">
        <div className="image-masonry">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="image-masonry__item"
              onClick={() => {
                setActiveIndex(index);
                setFullReady(false);
              }}
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
          ))}
        </div>
      </section>

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
                <strong>Photo Viewer</strong>
                <div className="lightbox__hint">{currentLabel}</div>
              </div>
              <button type="button" className="ghost-button" onClick={() => setActiveIndex(null)}>
                关闭
              </button>
            </div>

            <div className="lightbox__viewer">
              <img
                className="lightbox__preview"
                src={activeImage.preview.src}
                alt=""
                aria-hidden="true"
                width={activeImage.preview.width}
                height={activeImage.preview.height}
              />
              <img
                className={`lightbox__full${fullReady ? " is-ready" : ""}`}
                src={activeImage.full.src}
                alt={activeImage.alt}
                width={activeImage.width}
                height={activeImage.height}
                onLoad={() => setFullReady(true)}
              />
            </div>

            <div className="lightbox__nav">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setFullReady(false);
                  setActiveIndex((current) =>
                    current === null ? 0 : (current - 1 + images.length) % images.length
                  );
                }}
              >
                上一张
              </button>

              <div className="lightbox__hint">{activeImage.alt}</div>

              <div className="lightbox__actions">
                <a
                  className="ghost-button"
                  href={activeImage.full.src}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开原图
                </a>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setFullReady(false);
                    setActiveIndex((current) =>
                      current === null ? 0 : (current + 1) % images.length
                    );
                  }}
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
