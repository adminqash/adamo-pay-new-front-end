import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * scroll to top component
 * 
 * automatically scrolls to the top of the page when the route changes
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
