import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@adamosuiteservices/ui/breadcrumb";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageLoader } from "@/features/common/components/layout/page-loader";
import type { InfolaftMatch } from "@/features/compliance/application/entities/compliance-case.entity";
import { FindingDetailSheet } from "../components/finding-detail-sheet";
import { ResolveFindingDialog } from "../components/resolve-finding-dialog";
import {
  useComplianceCase,
  useComplianceScreening,
  useResolveFinding,
} from "../hooks/use-compliance-case";
import { complianceReviewPath } from "../utils/compliance-paths";

export function FindingReviewPage() {
  const { t } = useTranslation(["compliance"]);
  const navigate = useNavigate();
  const params = useParams<{
    paymentId?: string
    batchId?: string
    transactionId?: string
  }>();
  const subjectId = params.transactionId ?? params.paymentId;
  const { complianceCase, isLoading } = useComplianceCase(subjectId);
  const { screening } = useComplianceScreening(subjectId, Boolean(subjectId));
  const resolveFinding = useResolveFinding(subjectId ?? "");
  const [tab, setTab] = useState<"document" | "name">("document");
  const [selected, setSelected] = useState<InfolaftMatch | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const byDocument = screening?.byDocumentNumber ?? [];
  const byName = screening?.byName ?? [];
  const rows = tab === "document" ? byDocument : byName;

  useEffect(() => {
    if (byDocument.length === 0 && byName.length > 0) {
      setTab("name");
    }
  }, [byDocument.length, byName.length]);
  const unresolvedFinding = useMemo(
    () => complianceCase?.findings.find((finding) => !finding.resolved) ?? complianceCase?.findings[0],
    [complianceCase],
  );

  if (isLoading || !complianceCase || !subjectId) {
    return <PageLoader />;
  }

  const reviewPath = complianceReviewPath({
    subjectId,
    batchId: params.batchId ?? complianceCase.batchId,
  });

  const handleResolve = async(note: string) => {
    if (!unresolvedFinding) {
      return;
    }
    await resolveFinding.mutateAsync({ findingKey: unresolvedFinding.key, note });
    setResolveOpen(false);
    navigate(reviewPath);
  };

  const formatScore = (score?: number) => {
    if (score === undefined) {
      return "—";
    }
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 5 }).format(score);
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={params.batchId ? `/batches/${params.batchId}` : "/transactions"}>
                  {params.batchId ? t("compliance:breadcrumbs.batch") : t("compliance:breadcrumbs.transactions")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={reviewPath}>{t("compliance:review.title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("compliance:novedad.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        <Card className="flex flex-col gap-6 rounded-3xl p-6">
          <Tabs value={tab} onValueChange={(value) => setTab(value as "document" | "name")}>
            <TabsList>
              <TabsTrigger value="document">
                {t("compliance:novedad.by_document")}
                {byDocument.length > 0 && (
                  <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-warning text-xs text-white">
                    {byDocument.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="name">
                {t("compliance:novedad.by_name")}
                {byName.length > 0 && (
                  <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-warning text-xs text-white">
                    {byName.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("compliance:novedad.columns.id")}</TableHead>
                <TableHead>{t("compliance:novedad.columns.match")}</TableHead>
                <TableHead>{t("compliance:novedad.columns.score")}</TableHead>
                <TableHead>{t("compliance:novedad.columns.risk")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-neutrals-500">
                    {t("compliance:novedad.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={`${row.id}-${row.codigoLista}`}
                    className="cursor-pointer"
                    onClick={() => setSelected(row)}
                  >
                    <TableCell>{row.documentId ?? row.id}</TableCell>
                    <TableCell>
                      {row.fullName} | {row.codigoLista || row.nombreLista}
                    </TableCell>
                    <TableCell>{formatScore(row.score)}</TableCell>
                    <TableCell>{row.riskLevel ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => navigate(reviewPath)}>
              {t("compliance:actions.cancel")}
            </Button>
            {complianceCase.canResolveFindings && unresolvedFinding && !unresolvedFinding.resolved && (
              <Button variant="default" onClick={() => setResolveOpen(true)}>
                {t("compliance:novedad.resolve_action")}
              </Button>
            )}
          </div>
        </Card>
      </PageContainer>
      <FindingDetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
        match={selected}
      />
      <ResolveFindingDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        isPending={resolveFinding.isPending}
        onConfirm={(note) => void handleResolve(note)}
      />
    </>
  );
}
