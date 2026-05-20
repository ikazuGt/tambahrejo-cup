"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  children: React.ReactNode;
};

export function ImageModal({ src, alt, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ all: "unset", cursor: "zoom-in", display: "inline-flex" }}
        aria-label={`Lihat foto ${alt}`}
      >
        {children}
      </button>

      {open && (
        <div
          className="img-modal-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="img-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="img-modal-img" />
            <div className="img-modal-caption">{alt}</div>
          </div>
          <button
            type="button"
            className="img-modal-close"
            onClick={() => setOpen(false)}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
