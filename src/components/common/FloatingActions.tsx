import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () =>
      setShowScrollTop(window.scrollY >= window.innerHeight);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);
  return (
    <>
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 sm:right-6">
        {showScrollTop && (
          <button
            type="button"
            aria-label="Scroll to top"
            title="Back to top"
            onClick={() => {
              const useNative = window.dispatchEvent(
                new Event("website:scroll-to-top", { cancelable: true }),
              );
              if (useNative) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
            className="grid size-13 place-items-center rounded-full border border-brand-100 bg-white text-brand-700 shadow-lg hover:bg-brand-50 cursor-pointer"
          >
            <ArrowUp size={23} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  );
}
