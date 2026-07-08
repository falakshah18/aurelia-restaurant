import { useEffect, useRef } from "react";

// Applies "in" class to elements with .fade-up when they scroll into view
export default function useFadeInOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current || document;
    const items = root.querySelectorAll(".fade-up");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}
