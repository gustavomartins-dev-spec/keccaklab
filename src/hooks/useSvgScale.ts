import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Tracks how much an SVG with the given viewBox is scaled on screen (preserveAspectRatio "meet"),
 * exposed as the CSS variable --s so text can compensate and never render below 12px.
 */
export function useSvgScale<T extends SVGSVGElement>(viewWidth: number, viewHeight: number) {
  const ref = useRef<T>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setScale(Math.min(width / viewWidth, height / viewHeight));
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [viewWidth, viewHeight]);
  return [ref, { '--s': scale } as CSSProperties] as const;
}
