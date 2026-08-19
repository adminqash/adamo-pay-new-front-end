import { useQuery } from "@tanstack/react-query";
import { AuthorizeService } from "@/features/auth/api/services/authorize.service";
import { isEnvJwtAuth } from "@/lib/auth/env-access-token";
import { queryKeys } from "@/lib/query/query-keys";

export function useAuthorize() {
  const query = useQuery({
    queryKey: queryKeys.auth.authorize,
    queryFn: AuthorizeService.check,
    enabled: !isEnvJwtAuth(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      showMessageOnError: false,
    },
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
