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
import { useHome } from "@/features/home/application/hooks/use-home";
import { usePaymentsRealtime } from "@/features/transactions/application/hooks/use-payments-realtime";
import { useAccountBalanceRealtime } from "@/features/accounts/application/hooks/use-account-balance-realtime";

const DASHBOARD_QUERY_KEY = ["dashboard"];

export function HomePage() {
  const { t } = useTranslation(["home"]);
  const navigate = useNavigate();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const home = useHome();
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
        <div className="flex flex-col gap-4 w-full">
          {/* top cards section */}
          <div className="flex flex-wrap gap-4 w-full">
            {/* wallet card with gradient */}
            <Card className="flex-1 min-w-[320px] bg-gradient-to-r from-[#e5f3fa] to-white border-0 p-6 flex flex-col justify-between min-h-[212px]">
              <div className="flex flex-col gap-4 items-start">
                <div className="text-sm text-foreground font-bold leading-5">
                  {t("home:home.wallet_card.title")}
                </div>
                <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                  <CountryFlag countryCode={home.data?.walletBalance.countryCode || "CO"} />
                  <span className="text-sm font-bold text-foreground">
                    {home.data?.walletBalance.amount}
                  </span>
                  <span className="text-sm text-foreground">
                    {home.data?.walletBalance.currency}
                  </span>
                </div>
              </div>
              <Button variant="link" className="justify-start p-0 h-6 text-pay-500 w-auto" asChild>
                <Link to="/accounts">
                  {t("home:home.wallet_card.manage_accounts")}
                  <Icon symbol="chevron_forward" />
                </Link>
              </Button>
            </Card>

            {/* send payment card */}
            <Card className="flex-1 min-w-[320px] bg-primary-50 border-transparent p-6 flex flex-col gap-8">
              <div className="flex flex-col gap-4 items-start">
                <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                  <Icon symbol="price_check" weight={300} className="text-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {t("home:home.send_payment_card.title")}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-5">
                  {t("home:home.send_payment_card.description")}
                </p>
              </div>
              <Button variant="default" className="w-fit" asChild>
                <Link to="/transactions/create">
                  {t("home:home.send_payment_card.button")}
                </Link>
              </Button>
            </Card>
          </div>

          {/* file upload section */}
          <Card className="w-full p-6 flex flex-col gap-6">
            <div className="flex items-center gap-8">
              <h2 className="text-sm text-foreground leading-5">
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

          {/* transaction stats section */}
          <Card className="w-full p-6 flex flex-col gap-6">
            <div className="flex items-center gap-8">
              <h2 className="text-sm text-foreground leading-5">
                {t("home:home.transactions.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500" asChild>
                <Link to="/transactions">
                  {t("home:home.transactions.view_all")}
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 w-full">
              {/* pending transactions */}
              <Card className="flex-1 min-w-[320px] bg-muted p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                    <img src="/icons/pending.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.pending.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-5">
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
              <Card className="flex-1 min-w-[320px] bg-muted p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                    <img src="/icons/returned.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.returned.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-5">
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
              <Card className="flex-1 min-w-[320px] bg-muted p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                    <img src="/icons/rejected.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.rejected.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-5">
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
              <Card className="flex-1 min-w-[320px] bg-muted p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                    <img src="/icons/validated.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.validated.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-5">
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
              <Card className="flex-1 min-w-[320px] bg-muted p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-background rounded-full px-4 py-4 h-14">
                    <img src="/icons/paid.png" alt="" className="size-6" />
                    <span className="text-sm font-bold text-foreground">
                      {home.data?.transactionStats.paid.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-5">
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
        </div>
      </PageContainer>
    </>
  );
}
