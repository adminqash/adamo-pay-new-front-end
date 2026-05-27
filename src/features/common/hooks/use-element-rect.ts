/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

export type ElementRect = {
  x: number
  y: number
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
};

export function useElementRect(selector: string): ElementRect | null {
  const [rect, setRect] = useState<ElementRect | null>(null);

  useEffect(() => {
    const element = document.querySelector(selector);

    if (!element) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const boundingRect = element.getBoundingClientRect();
      setRect({
        x: boundingRect.x,
        y: boundingRect.y,
        width: boundingRect.width,
        height: boundingRect.height,
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left,
      });
    };

    updateRect();

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(element);

    window.addEventListener("scroll", updateRect);
    window.addEventListener("resize", updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [selector]);

  return rect;
}
