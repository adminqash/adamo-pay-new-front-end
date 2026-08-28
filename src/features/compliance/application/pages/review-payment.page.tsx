import { Alert, AlertDescription, AlertTitle } from "@adamosuiteservices/ui/alert";
import { Badge } from "@adamosuiteservices/ui/badge";
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
import { Icon } from "@adamosuiteservices/ui/icon";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageLoader } from "@/features/common/components/layout/page-loader";
import { useCountry } from "@/features/common/contexts/use-country";
import { documentTypeLabel } from "@/lib/document-type";
import { formatCurrencyDisplay } from "@/lib/money/money";
import { CommentsThread } from "../components/comments-thread";
import { ApprovePaymentDialog } from "../components/approve-payment-dialog";
import { RejectPaymentDialog } from "../components/reject-payment-dialog";
import { RestrictiveListCard } from "../components/restrictive-list-card";
import {
  useAddComplianceComment,
  useApproveComplianceCase,
  useComplianceBreakdown,
  useComplianceCase,
  useRejectComplianceCase,
} from "../hooks/use-compliance-case";
import { complianceNovedadPath } from "../utils/compliance-paths";

export function ReviewPaymentPage() {
  const { t } = useTranslation(["compliance", "transactions"]);
  const navigate = useNavigate();
  const { currencyUpper } = useCountry();
  const params = useParams<{
    paymentId?: string
    batchId?: string
    transactionId?: string
  }>();
  const subjectId = params.transactionId ?? params.paymentId;
  const { complianceCase, isLoading } = useComplianceCase(subjectId);
  const isAmountReview = complianceCase?.instance === "adamo"
    || complianceCase?.verdict === "review";
  const { breakdown } = useComplianceBreakdown(subjectId, isAmountReview);
  const approve = useApproveComplianceCase(subjectId ?? "");
  const reject = useRejectComplianceCase(subjectId ?? "");
  const comment = useAddComplianceComment(subjectId ?? "");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  if (isLoading || !complianceCase || !subjectId) {
    return <PageLoader />;
  }

  const formatAmount = (amount: number) =>
    formatCurrencyDisplay(amount, complianceCase.payment.currency || currencyUpper);
  const accountLabel = [
    complianceCase.payment.accountType,
    complianceCase.payment.bank,
    complianceCase.payment.accountNumber
      ? `Nº ${complianceCase.payment.accountNumber}`
      : undefined,
  ]
    .filter(Boolean)
    .join(". ");

  const novedadPath = complianceNovedadPath({
    subjectId,
    batchId: params.batchId ?? complianceCase.batchId,
  });

  const handleApprove = async(note: string) => {
    await approve.mutateAsync(note);
    setApproveOpen(false);
    navigate(params.batchId ? `/batches/${params.batchId}` : "/transactions");
  };

  const handleReject = async(note: string) => {
    await reject.mutateAsync(note);
    setRejectOpen(false);
    navigate(params.batchId ? `/batches/${params.batchId}` : "/transactions");
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
              <BreadcrumbPage>{t("compliance:review.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        <Card className="flex flex-col gap-6 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-neutrals-500">{t("compliance:review.payment_status")}</p>
              <Badge variant="destructive-medium" className="h-8 px-2 text-sm">
                {t("transactions:transactions.status.for-review")}
              </Badge>
            </div>
            {complianceCase.reference && (
              <p className="text-sm text-neutrals-700">
                {t("compliance:review.reference")}: <span className={`
                  font-semibold
                `}
                                                    >{complianceCase.reference}
                                                    </span>
              </p>
            )}
          </div>

          {complianceCase.awaitingAdamo ? (
            <Alert variant="destructive" className="border-0 bg-destructive-50">
              <Icon symbol="info" />
              <AlertTitle>{t("compliance:review.waiting_title")}</AlertTitle>
              <AlertDescription>{t("compliance:review.waiting_description")}</AlertDescription>
            </Alert>
          ) : isAmountReview ? (
            <Alert variant="warning" className="border-0 bg-warning-50">
              <Icon symbol="info" />
              <AlertTitle>{t("compliance:review.amount_title")}</AlertTitle>
              <AlertDescription>{t("compliance:review.amount_description")}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning" className="border-0 bg-warning-50">
              <Icon symbol="info" />
              <AlertTitle>{t("compliance:review.findings_title")}</AlertTitle>
              <AlertDescription>{t("compliance:review.findings_description")}</AlertDescription>
            </Alert>
          )}

          {complianceCase.deferredScreening && (
            <Alert className="border-0 bg-neutrals-50">
              <Icon symbol="info" />
              <AlertTitle>{t("compliance:review.deferred_title")}</AlertTitle>
              <AlertDescription>{t("compliance:review.deferred_description")}</AlertDescription>
            </Alert>
          )}

          <div className={`
            grid grid-cols-1 gap-4
            lg:grid-cols-2
          `}
          >
            <div className="flex flex-col gap-4 rounded-3xl bg-neutrals-50 p-6">
              <p className="text-sm text-neutrals-500">{t("compliance:review.beneficiary")}</p>
              <Card className="flex flex-col gap-4 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutrals-500">{t("compliance:review.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="account_circle"
                      weight={200}
                      className="size-6"
                    />
                    <p className="text-sm font-semibold">{complianceCase.beneficiary.fullName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutrals-500">{t("compliance:review.id_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="contacts" weight={200} className="size-6" />
                    <p className="text-sm font-semibold">
                      {documentTypeLabel(complianceCase.beneficiary.idType)}: {complianceCase.beneficiary.idNumber}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl bg-neutrals-50 p-6">
              <p className="text-sm text-neutrals-500">{t("compliance:review.payment_info")}</p>
              <Card className="flex flex-col gap-4 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutrals-500">{t("compliance:review.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="paid" weight={200} className="size-6" />
                    <p className="text-sm font-semibold">{formatAmount(complianceCase.payment.amount)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-neutrals-500">{t("compliance:review.account")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="account_balance"
                      weight={200}
                      className="size-6"
                    />
                    <p className="text-sm font-semibold">{accountLabel || "—"}</p>
                  </div>
                </div>
                {complianceCase.batchName && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutrals-500">{t("compliance:review.batch")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="folder" weight={200} className="size-6" />
                      <p className="text-sm font-semibold">{complianceCase.batchName}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {(complianceCase.reasons.length > 0 || complianceCase.alerts.length > 0) && (
            <div className="flex flex-col gap-3 rounded-3xl bg-neutrals-50 p-6">
              {complianceCase.reasons.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-neutrals-500">{t("compliance:review.reasons")}</p>
                  {complianceCase.reasons.map((reason) => (
                    <p
                      key={`${reason.code}-${reason.rule ?? ""}`}
                      className="text-sm text-neutrals-800"
                    >
                      {reason.detail || reason.code}
                    </p>
                  ))}
                </div>
              )}
              {complianceCase.alerts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-neutrals-500">{t("compliance:review.alerts")}</p>
                  {complianceCase.alerts.map((alert) => (
                    <p
                      key={`${alert.code}-${alert.rule ?? ""}`}
                      className="text-sm text-neutrals-800"
                    >
                      {alert.detail || alert.code}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {breakdown && breakdown.months.length > 0 && (
            <div className="flex flex-col gap-3 rounded-3xl bg-neutrals-50 p-6">
              <p className="text-sm text-neutrals-500">{t("compliance:review.breakdown")}</p>
              {breakdown.months.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-neutrals-700">{month.month}</span>
                  <span className="font-semibold">
                    {formatCurrencyDisplay(
                      Math.round(month.total * 100),
                      complianceCase.payment.currency || currencyUpper,
                    )}
                    {" · "}
                    {t("compliance:review.breakdown_count", { count: month.count })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {complianceCase.findings.length > 0 && (
            <div className="flex flex-col gap-4 rounded-3xl bg-[#e5f3fa] p-6">
              <p className="text-sm text-neutrals-500">{t("compliance:review.restrictive_list")}</p>
              {complianceCase.findings.map((finding) => (
                <RestrictiveListCard
                  key={finding.key}
                  finding={finding}
                  onReview={() => navigate(novedadPath)}
                />
              ))}
              {complianceCase.canResolveFindings && !complianceCase.findingsResolved && (
                <p className="text-xs text-destructive italic">
                  {t("compliance:review.resolve_to_confirm")}
                </p>
              )}
            </div>
          )}

          {(complianceCase.canComment || complianceCase.comments.length > 0) && (
            <CommentsThread
              comments={complianceCase.comments}
              canComment={complianceCase.canComment}
              isPending={comment.isPending}
              onSubmit={(input) => comment.mutate(input)}
            />
          )}

          {(complianceCase.canReject || complianceCase.canApprove) && (
            <div className="flex flex-wrap gap-4">
              {complianceCase.canReject && (
                <Button variant="destructive-medium" onClick={() => setRejectOpen(true)}>
                  {t("compliance:review.reject_action")}
                </Button>
              )}
              {complianceCase.canApprove && (
                <Button
                  variant="default"
                  disabled={
                    (complianceCase.canResolveFindings && !complianceCase.findingsResolved)
                    || approve.isPending
                  }
                  onClick={() => setApproveOpen(true)}
                >
                  {t("compliance:review.approve_action")}
                </Button>
              )}
            </div>
          )}
        </Card>
      </PageContainer>
      <RejectPaymentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isPending={reject.isPending}
        onConfirm={(note) => void handleReject(note)}
      />
      <ApprovePaymentDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        isPending={approve.isPending}
        onConfirm={(note) => void handleApprove(note)}
      />
    </>
  );
}
