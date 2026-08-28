import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { FileUpload } from "@adamosuiteservices/ui/file-upload";
import { Icon } from "@adamosuiteservices/ui/icon";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useCountry } from "@/features/common/contexts/use-country";
import { useHome } from "@/features/home/application/hooks/use-home";
import { usePaymentsRealtime } from "@/features/transactions/application/hooks/use-payments-realtime";
import { useAccountBalanceRealtime } from "@/features/accounts/application/hooks/use-account-balance-realtime";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import { VIEW_TRANSACTIONS } from "@/features/auth/domain/permission-ui";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { useComplianceSummary } from "@/features/compliance/application/hooks/use-compliance-case";

const DASHBOARD_QUERY_KEY = ["dashboard"];

export function HomePage() {
  const { t } = useTranslation(["home"]);
  const navigate = useNavigate();
  const { countryCode } = useCountry();
  const { capabilities } = usePermissions();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const home = useHome();
  const { summary: complianceSummary } = useComplianceSummary();
  const isComplianceOfficer = capabilities.canListCompliancePending;
  const pendingFindings
    = complianceSummary?.pendingFindings
      ?? home.data?.complianceStats.pendingFindings
      ?? 0;
  const waitingResolution
    = complianceSummary?.waitingResolution
      ?? home.data?.complianceStats.waitingResolution
      ?? 0;
  const newActivity
    = complianceSummary?.newActivity
      ?? home.data?.complianceStats.newActivity
      ?? 0;
  const pendingFindingsHref = isComplianceOfficer
    ? "/compliance?status=for-review"
    : "/transactions?status=for-review";
  const waitingResolutionHref = isComplianceOfficer
    ? "/compliance?status=waiting-for-resolution"
    : "/transactions?status=waiting-for-resolution";
  usePaymentsRealtime({ extraInvalidateKeys: [DASHBOARD_QUERY_KEY] });
  useAccountBalanceRealtime({ extraInvalidateKeys: [DASHBOARD_QUERY_KEY] });

  /**
   * navigate to create batch when file is selected
   */
  const handleFileSelect = (file: File | null) => {
    if (file) {
      navigate("/batches/create", { state: { file } });
    }
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("home:home.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <div className="flex w-full flex-col gap-4">
          {/* top cards section */}
          <div className="flex w-full flex-wrap gap-4">
            <PermissionGate when={capabilities.canViewBalance}>
              <Card className={`
                flex min-h-[212px] min-w-[320px] flex-1 flex-col justify-between
                border-0 bg-gradient-to-r from-[#e5f3fa] to-white p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="text-sm leading-5 font-bold text-foreground">
                    {t("home:home.wallet_card.title")}
                  </div>
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <CountryFlag countryCode={home.data?.walletBalance.countryCode || countryCode} />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.walletBalance.amount}
                    </span>
                    <span className="text-sm text-foreground">
                      {home.data?.walletBalance.currency}
                    </span>
                  </div>
                </div>
                <PermissionGate permission={PERMISSIONS.ACCOUNTS_LIST}>
                  <Button
                    variant="link"
                    className="h-6 w-auto justify-start p-0 text-pay-500"
                    asChild
                  >
                    <Link to="/accounts">
                      {t("home:home.wallet_card.manage_accounts")}
                      <Icon symbol="chevron_forward" />
                    </Link>
                  </Button>
                </PermissionGate>
              </Card>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE}>
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 border-transparent
                bg-primary-50 p-6
              `}
              >
              <div className="flex flex-col items-start gap-4">
                <div className={`
                  inline-flex h-14 items-center gap-3 rounded-full bg-background
                  px-4 py-4
                `}
                >
                  <Icon
                    symbol="price_check"
                    weight={300}
                    className="text-foreground"
                  />
                  <span className="text-sm font-bold text-foreground">
                    {t("home:home.send_payment_card.title")}
                  </span>
                </div>
                <p className="text-sm leading-5 text-foreground">
                  {t("home:home.send_payment_card.description")}
                </p>
              </div>
              <Button variant="default" className="w-fit" asChild>
                <Link to="/transactions/create">
                  {t("home:home.send_payment_card.button")}
                </Link>
              </Button>
              </Card>
            </PermissionGate>
          </div>

          <PermissionGate permission={PERMISSIONS.PAYMENTS_BATCH_CREATE}>
          <Card className="flex w-full flex-col gap-6 p-6">
            <div className="flex items-center gap-8">
              <h2 className="text-sm leading-5 text-foreground">
                {t("home:home.batch_upload.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500" asChild>
                <Link to="/batches">
                  {t("home:home.batch_upload.view_all")}
                </Link>
              </Button>
            </div>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedExtensions={[".xlsx", ".numbers"]}
              maxSizeInMB={50}
              labels={{
                dragDrop: t("home:home.batch_upload.drag_drop"),
                selectFile: t("home:home.batch_upload.select_file"),
                fileRequirements: t("home:home.batch_upload.requirements"),
              }}
            />
          </Card>
          </PermissionGate>

          <PermissionGate permission={[...VIEW_TRANSACTIONS, PERMISSIONS.COMPLIANCE_PENDING_LIST]} mode="any">
          <Card className="flex w-full flex-col gap-6 p-6">
            <div className="flex items-center gap-8">
              <h2 className="text-sm leading-5 text-foreground">
                {t("home:home.compliance.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500" asChild>
                <Link to={isComplianceOfficer ? "/compliance" : pendingFindingsHref}>
                  {t("home:home.compliance.view_all")}
                </Link>
              </Button>
            </div>
            <div className="flex w-full flex-wrap gap-4">
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <Icon
                      symbol="warning"
                      weight={300}
                      className="text-foreground"
                    />
                    <span className="text-sm font-bold text-foreground">
                      {pendingFindings.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.compliance.pending_findings.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to={pendingFindingsHref}>
                    {t("home:home.compliance.pending_findings.button")}
                  </Link>
                </Button>
              </Card>
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <Icon
                      symbol="hourglass_empty"
                      weight={300}
                      className="text-foreground"
                    />
                    <span className="text-sm font-bold text-foreground">
                      {waitingResolution.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.compliance.waiting_resolution.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to={waitingResolutionHref}>
                    {t("home:home.compliance.waiting_resolution.button")}
                  </Link>
                </Button>
              </Card>
              {isComplianceOfficer && (
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <Icon
                      symbol="mark_chat_unread"
                      weight={300}
                      className="text-foreground"
                    />
                    <span className="text-sm font-bold text-foreground">
                      {newActivity.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.compliance.new_activity.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to="/compliance?status=waiting-for-resolution&activity=new">
                    {t("home:home.compliance.new_activity.button")}
                  </Link>
                </Button>
              </Card>
              )}
            </div>
          </Card>
          </PermissionGate>

          <PermissionGate permission={[...VIEW_TRANSACTIONS]} mode="any">
          <Card className="flex w-full flex-col gap-6 p-6">
            <div className="flex items-center gap-8">
              <h2 className="text-sm leading-5 text-foreground">
                {t("home:home.transactions.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500" asChild>
                <Link to="/transactions">
                  {t("home:home.transactions.view_all")}
                </Link>
              </Button>
            </div>
            <div className="flex w-full flex-wrap gap-4">
              {/* pending transactions */}
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <img src="/icons/pending.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.pending.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.transactions.pending.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to="/transactions?status=pending">
                    {t("home:home.transactions.pending.button")}
                  </Link>
                </Button>
              </Card>

              {/* returned transactions */}
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <img src="/icons/returned.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.returned.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.transactions.returned.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to="/transactions?status=returned">
                    {t("home:home.transactions.returned.button")}
                  </Link>
                </Button>
              </Card>

              {/* rejected transactions */}
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <img src="/icons/rejected.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.rejected.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.transactions.rejected.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit" asChild>
                  <Link to="/transactions?status=rejected">
                    {t("home:home.transactions.rejected.button")}
                  </Link>
                </Button>
              </Card>

              {/* validated transactions */}
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <img src="/icons/validated.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.validated.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.transactions.validated.title")}
                  </p>
                </div>
                <Button variant="secondary" className="w-fit" asChild>
                  <Link to="/transactions?status=validated">
                    {t("home:home.transactions.validated.button")}
                  </Link>
                </Button>
              </Card>

              {/* paid transactions */}
              <Card className={`
                flex min-w-[320px] flex-1 flex-col gap-8 bg-muted p-6
              `}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full
                    bg-background px-4 py-4
                  `}
                  >
                    <img src="/icons/paid.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.paid.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm leading-5 text-foreground">
                    {t("home:home.transactions.paid.title")}
                  </p>
                </div>
                <Button variant="secondary" className="w-fit" asChild>
                  <Link to="/transactions?status=paid">
                    {t("home:home.transactions.paid.button")}
                  </Link>
                </Button>
              </Card>
            </div>
          </Card>
          </PermissionGate>
        </div>
      </PageContainer>
    </>
  );
}
