import { FullScreenLoaderManager } from "@adamosuiteservices/ui/full-screen-loader";
import { useIsFetching } from "@tanstack/react-query";
import { useEffect } from "react";

export function GlobalQueryLoader() {
  const isFetchingWithLoader = useIsFetching({
    predicate: (query) => query.state.status === "pending" && query.meta?.showLoader !== false,
  });

  useEffect(() => {
    if (isFetchingWithLoader > 0) {
      FullScreenLoaderManager.show();
    } else {
      FullScreenLoaderManager.hide();
    }
  }, [isFetchingWithLoader]);

  return null;
}
