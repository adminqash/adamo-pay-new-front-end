import { useQuery } from "@tanstack/react-query";
import { useCountry } from "@/features/common/contexts/use-country";
import { SourceService } from "@/features/source/api/services/source.service";
import type { SourceBankDTO, SourceCatalogItemDTO } from "@/features/source/api/dtos/source.dto";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export type SourceCatalogItem = SourceCatalogItemDTO;
export type SourceBank = SourceBankDTO;

export function useSourceCatalog(key = "base") {
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.source.catalog(key), countryCode),
    queryFn: () => SourceService.get(key, countryCode),
    ...queryDefaults,
    staleTime: 5 * 60_000,
    meta: {
      showMessageOnSuccess: false,
    },
  });

  const source = query.data?.data ?? null;
  const documentTypes = source?.supportedDocumentTypes?.length
    ? source.supportedDocumentTypes
    : source?.documentTypes ?? [];
  const accountTypes = source?.supportedBankAccountTypes?.length
    ? source.supportedBankAccountTypes
    : source?.accountTypes ?? [];
  const banks = source?.banks ?? [];
  const specialBanks = (source?.specialBanks ?? []).map((code) => ({
    name: code.toLowerCase() === "breb" ? "BreB" : code,
    achCode: code,
  }));
  const bankOptions = [
    ...specialBanks.filter(
      (special) => !banks.some((bank) => bank.achCode === special.achCode),
    ),
    ...banks,
  ];

  return {
    source,
    documentTypes,
    accountTypes,
    banks: bankOptions,
    defaults: source?.defaults,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function matchSourceCode(
  stored: string | undefined | null,
  items: SourceCatalogItem[],
): string {
  if (!stored) {
    return "";
  }

  const compact = compactToken(stored);
  const direct = items.find(
    (item) =>
      item.code === stored
      || compactToken(item.code) === compact
      || item.type === stored
      || compactToken(item.type ?? "") === compact
      || compactToken(item.name) === compact,
  );
  if (direct) {
    return direct.code;
  }

  const groups = [
    ["checking", "27", "1", "corriente"],
    ["savings", "37", "2", "ahorros", "ahorro"],
  ];

  for (const group of groups) {
    if (!group.includes(compact)) {
      continue;
    }
    const match = items.find((item) => group.includes(compactToken(item.code)));
    if (match) {
      return match.code;
    }
  }

  return stored;
}

export function sourceCatalogLabel(
  stored: string | undefined | null,
  items: SourceCatalogItem[],
): string {
  if (!stored) {
    return "";
  }

  const code = matchSourceCode(stored, items);
  const item = items.find(
    (entry) => entry.code === code || entry.type === code || compactToken(entry.name) === compactToken(stored),
  );
  return item?.name ?? stored;
}

function compactToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
