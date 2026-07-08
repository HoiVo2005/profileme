"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const currentImage = images[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setIsLightboxOpen(false);
  };

  return (
    <>
      <div className="project-gallery">
        <div className="gallery-main">
          <img
            src={currentImage}
            alt={`${title} - Ảnh ${selectedIndex + 1}`}
            onClick={() => setIsLightboxOpen(true)}
            style={{ cursor: "pointer" }}
          />
          {images.length > 1 && (
            <>
              <button
                className="gallery-nav prev"
                onClick={handlePrevious}
                title="Ảnh trước"
              >
                <ChevronLeft />
              </button>
              <button
                className="gallery-nav next"
                onClick={handleNext}
                title="Ảnh tiếp theo"
              >
                <ChevronRight />
              </button>
              <div className="gallery-counter">
                {selectedIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`thumbnail ${idx === selectedIndex ? "active" : ""}`}
                onClick={() => setSelectedIndex(idx)}
                title={`Ảnh ${idx + 1}`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="lightbox-backdrop"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={0}
        >
          <div className="lightbox-content">
            <button
              className="lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              title="Đóng"
            >
              <X />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="lightbox-nav prev"
                  onClick={handlePrevious}
                  title="Ảnh trước"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="lightbox-nav next"
                  onClick={handleNext}
                  title="Ảnh tiếp theo"
                >
                  <ChevronRight />
                </button>
              </>
            )}
            <img
              src={currentImage}
              alt={`${title} - Phóng to ảnh ${selectedIndex + 1}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
