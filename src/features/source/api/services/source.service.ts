import type { SourceCatalogDTO } from "@/features/source/api/dtos/source.dto";
import { coreApi } from "@/lib/api/api";
import { apiGetRaw } from "@/lib/api/http.service";
import type { ServiceResult } from "@/features/common/services/service-result";

export class SourceService {
  public static GET_SOURCE_KEY = "get_source_key";

  public static async get(
    key = "base",
    countryCode?: string,
  ): Promise<ServiceResult<SourceCatalogDTO>> {
    return apiGetRaw<SourceCatalogDTO>(coreApi, "/source", { key, countryCode });
  }
}
