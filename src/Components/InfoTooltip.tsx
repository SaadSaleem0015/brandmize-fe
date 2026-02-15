import { useState, useRef, useEffect } from "react";
import { FiInfo } from "react-icons/fi";

// Tooltip Component with better hover handling
export const InfoTooltip = ({ content }: { content: React.ReactNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving to a non-child element
      if (
        !tooltipRef.current?.contains(e.relatedTarget as Node) &&
        !containerRef.current?.contains(e.relatedTarget as Node)
      ) {
        setShowTooltip(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* Info Icon */}
      <button
        type="button"
        className="text-gray-400 hover:text-primary focus:outline-none focus:text-primary transition-colors duration-150"
        aria-label="More information"
      >
        <FiInfo className="w-4 h-4" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-80"
        >
          <div className="bg-gray-900 text-xs text-white rounded-lg p-2 shadow-xl animate-scaleIn origin-bottom">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <FiInfo className="w-3 h-3 text-primary" />
                </div>
              </div>
              <div className="flex-1">
               
                {content}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

