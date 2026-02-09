/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";
import type { ServiceResult } from "@/features/common/services/service-result";
import { isServiceResult } from "@/features/common/services/service-result";

export function useHandleQueryError<T>({
  error,
  fn,
}: {
  error: unknown
  fn: (error: ServiceResult<T>) => void
}) {
  useEffect(() => {
    if (error !== null && error !== undefined) {
      if (!isServiceResult(error)) {
        throw new Error(
          `Expected ServiceResult but received: ${typeof error}. Error: ${JSON.stringify(error)}`,
        );
      }

      fn(error as ServiceResult<T>);
    }
  }, [error]);
}
