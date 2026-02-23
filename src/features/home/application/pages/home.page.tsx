import { useState } from "react";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { FileUpload } from "@adamosuiteservices/ui/file-upload";
import { Icon } from "@adamosuiteservices/ui/icon";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useHome } from "@/features/home/application/hooks/use-home";

export function HomePage() {
  const { t } = useTranslation(["home"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const home = useHome();
  const [file, setFile] = useState<File | null>(null);

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
                <div className="text-sm text-neutrals-700 font-bold leading-5">
                  {t("home:home.wallet_card.title")}
                </div>
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                  <CountryFlag countryCode={home.data?.walletBalance.countryCode || "CO"} />
                  <span className="text-sm font-bold text-neutrals-700">
                    {home.data?.walletBalance.amount}
                  </span>
                  <span className="text-sm text-neutrals-700">
                    {home.data?.walletBalance.currency}
                  </span>
                </div>
              </div>
              <Button variant="link" className="justify-start p-0 h-6 text-pay-500 w-auto">
                {t("home:home.wallet_card.manage_accounts")}
                <Icon symbol="chevron_forward" />
              </Button>
            </Card>

            {/* send payment card */}
            <Card className="flex-1 min-w-[320px] bg-pay-50 border-transparent p-6 flex flex-col gap-8">
              <div className="flex flex-col gap-4 items-start">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                  <Icon symbol="price_check" className="text-neutrals-700" />
                  <span className="text-sm font-bold text-neutrals-700">
                    {t("home:home.send_payment_card.title")}
                  </span>
                </div>
                <p className="text-sm text-neutrals-900 leading-5">
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
              <h2 className="text-sm text-neutrals-900 leading-5">
                {t("home:home.batch_upload.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500">
                {t("home:home.batch_upload.view_all")}
              </Button>
            </div>
            <FileUpload
              selectedFile={file}
              onFileSelect={setFile}
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
              <h2 className="text-sm text-neutrals-900 leading-5">
                {t("home:home.transactions.title")}
              </h2>
              <Button variant="link" className="h-6 p-0 text-pay-500">
                {t("home:home.transactions.view_all")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 w-full">
              {/* pending transactions */}
              <Card className="flex-1 min-w-[320px] bg-neutral-50 p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <Icon symbol="error" className="text-neutrals-400" />
                    <span className="text-sm font-bold text-neutrals-700">
                      {home.data?.transactionStats.pending.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutrals-700 leading-5">
                    {t("home:home.transactions.pending.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit">
                  {t("home:home.transactions.pending.button")}
                </Button>
              </Card>

              {/* returned transactions */}
              <Card className="flex-1 min-w-[320px] bg-neutral-50 p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <Icon symbol="autorenew" className="text-warning-400" />
                    <span className="text-sm font-bold text-neutrals-700">
                      {home.data?.transactionStats.returned.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutrals-700 leading-5">
                    {t("home:home.transactions.returned.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit">
                  {t("home:home.transactions.returned.button")}
                </Button>
              </Card>

              {/* rejected transactions */}
              <Card className="flex-1 min-w-[320px] bg-neutral-50 p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <Icon symbol="cancel" className="text-error-400" />
                    <span className="text-sm font-bold text-neutrals-700">
                      {home.data?.transactionStats.rejected.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutrals-700 leading-5">
                    {t("home:home.transactions.rejected.title")}
                  </p>
                </div>
                <Button variant="default" className="w-fit">
                  {t("home:home.transactions.rejected.button")}
                </Button>
              </Card>

              {/* validated transactions */}
              <Card className="flex-1 min-w-[320px] bg-neutral-50 p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <Icon symbol="check_circle" className="text-pay-300" />
                    <span className="text-sm font-bold text-neutrals-700">
                      {home.data?.transactionStats.validated.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutrals-700 leading-5">
                    {t("home:home.transactions.validated.title")}
                  </p>
                </div>
                <Button variant="secondary" className="w-fit">
                  {t("home:home.transactions.validated.button")}
                </Button>
              </Card>

              {/* paid transactions */}
              <Card className="flex-1 min-w-[320px] bg-neutral-50 p-6 flex flex-col gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <Icon symbol="check_circle" className="text-success-400" />
                    <span className="text-sm font-bold text-neutrals-700">
                      {home.data?.transactionStats.paid.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutrals-700 leading-5">
                    {t("home:home.transactions.paid.title")}
                  </p>
                </div>
                <Button variant="secondary" className="w-fit">
                  {t("home:home.transactions.paid.button")}
                </Button>
              </Card>
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
