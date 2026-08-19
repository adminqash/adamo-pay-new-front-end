import { useQuery } from "@tanstack/react-query";
import { UserProfileService } from "@/features/auth/api/services/user-profile.service";
import { isEnvJwtAuth } from "@/lib/auth/env-access-token";
import { queryKeys } from "@/lib/query/query-keys";

export function useUserProfile() {
  const query = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: UserProfileService.getProfile,
    enabled: !isEnvJwtAuth(),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    refetch: query.refetch,
  };
}
