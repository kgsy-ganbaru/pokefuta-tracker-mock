"use client";

import { useState } from "react";

const FALLBACK_SRC = "/no-image.png";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImageWithFallback({
  src,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc || FALLBACK_SRC}
      onError={() => setCurrentSrc(FALLBACK_SRC)}
      className={className}
      alt={alt}
    />
  );
}
