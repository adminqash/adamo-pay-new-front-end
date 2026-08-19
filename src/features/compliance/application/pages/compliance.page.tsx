import { Card } from "@adamosuiteservices/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { useCountry } from "@/features/common/contexts/use-country";
import { useBatchesRealtime } from "@/features/batches/application/hooks/use-batches-realtime";
import { ComplianceService } from "@/features/compliance/api/services/compliance.service";
import { withCountryScope } from "@/lib/country/country-code";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function CompliancePage() {
  const { t } = useTranslation(["compliance", "batches"]);
  const { countryCode } = useCountry();
  const navigate = useNavigate();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");
  useBatchesRealtime();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.compliance.checks({ status: "pending" }), countryCode),
    queryFn: () => ComplianceService.listChecks({
      status: "pending",
      limit: 50,
      countryCode,
    }),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("compliance:errors.load_failed"),
    },
  });

  const checks = query.data?.data ?? [];

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("compliance:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6">
          {checks.length === 0 ? (
            <p className="text-sm text-foreground">{t("compliance:empty")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("compliance:columns.batch")}</TableHead>
                  <TableHead>{t("compliance:columns.subject")}</TableHead>
                  <TableHead>{t("compliance:columns.document")}</TableHead>
                  <TableHead>{t("compliance:columns.verdict")}</TableHead>
                  <TableHead>{t("compliance:columns.status")}</TableHead>
                  <TableHead>{t("compliance:columns.created_at")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow
                    key={check.id}
                    className={check.batchId ? "cursor-pointer" : undefined}
                    onClick={() => {
                      if (check.batchId) {
                        navigate(`/batches/${check.batchId}/transactions/${check.id}`);
                      }
                    }}
                  >
                    <TableCell>{check.batchName ?? check.batchId ?? "—"}</TableCell>
                    <TableCell>{check.beneficiaryName ?? check.subjectId}</TableCell>
                    <TableCell>{check.documentNumber ?? "—"}</TableCell>
                    <TableCell>
                      {check.verdict
                        ? t(`batches.screening.verdict.${check.verdict}`, {
                            defaultValue: check.verdict,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>{check.status ?? "—"}</TableCell>
                    <TableCell>
                      {check.createdAt ? new Date(check.createdAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageContainer>
    </>
  );
}
