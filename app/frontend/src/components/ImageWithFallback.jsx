import { useState } from "react";

export default function ImageWithFallback({ src, alt, className, ...props }) {
  const [errored, setErrored] = useState(false);

  return (
    <img
      src={errored ? "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=85" : src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
