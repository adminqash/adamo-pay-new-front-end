import type { ServiceResult } from "@/features/common/services/service-result";
import { coreApi } from "@/lib/api/api";
import { apiGetRaw, apiPatch } from "@/lib/api/http.service";

export type OperatingCountryItem = {
  countryCode: string
  currency: string
};

export type OrganizationCountriesDto = {
  countryCodes: string[]
  countries: OperatingCountryItem[]
  source: "organization" | "default"
};

export class OrganizationCountriesService {
  public static async getOperatingCountries(): Promise<
    ServiceResult<OrganizationCountriesDto>
  > {
    return apiGetRaw<OrganizationCountriesDto>(
      coreApi,
      "/organizations/countries",
    );
  }

  public static async patchOperatingCountries(body: {
    add?: string[]
    remove?: string[]
  }): Promise<ServiceResult<OrganizationCountriesDto>> {
    return apiPatch<OrganizationCountriesDto, OrganizationCountriesDto>(
      coreApi,
      "/organizations/countries",
      body,
      (dto) => dto,
    );
  }
}
