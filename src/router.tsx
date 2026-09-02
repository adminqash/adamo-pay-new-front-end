import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/features/common/components/layout/main-layout";
import { PageLoader } from "@/features/common/components/layout/page-loader";
import { RequirePermission } from "@/features/auth/application/components/require-permission";
import { PERMISSIONS, type PermissionMode } from "@/features/auth/domain/permissions";
import { VIEW_TRANSACTIONS } from "@/features/auth/domain/permission-ui";

const HomePage = lazy(() => import("@/features/home/application/pages/home.page").then((module) => ({ default: module.HomePage })));
const DocumentsPage = lazy(() => import("@/features/documents/application/pages/documents.page").then((module) => ({ default: module.DocumentsPage })));
const CreateDocumentPage = lazy(() => import("@/features/documents/application/pages/create-document.page").then((module) => ({ default: module.CreateDocumentPage })));
const TransactionsPage = lazy(() => import("@/features/transactions/application/pages/transactions.page").then((module) => ({ default: module.TransactionsPage })));
const CreatePaymentPage = lazy(() => import("@/features/transactions/application/pages/create-payment.page").then((module) => ({ default: module.CreatePaymentPage })));
const CorrectPaymentPage = lazy(() => import("@/features/transactions/application/pages/correct-payment.page").then((module) => ({ default: module.CorrectPaymentPage })));
const BatchesPage = lazy(() => import("@/features/batches/application/pages/batches.page").then((module) => ({ default: module.BatchesPage })));
const CreateBatchPage = lazy(() => import("@/features/batches/application/pages/create-batch.page").then((module) => ({ default: module.CreateBatchPage })));
const BatchDetailPage = lazy(() => import("@/features/batches/application/pages/batch-detail.page").then((module) => ({ default: module.BatchDetailPage })));
const TransactionDetailPage = lazy(() => import("@/features/batches/application/pages/transaction-detail.page").then((module) => ({ default: module.TransactionDetailPage })));
const AccountsPage = lazy(() => import("@/features/accounts/application/pages/accounts.page").then((module) => ({ default: module.AccountsPage })));
const AccountMovementsPage = lazy(() => import("@/features/accounts/application/pages/account-movements.page").then((module) => ({ default: module.AccountMovementsPage })));
const BeneficiariesPage = lazy(() => import("@/features/beneficiaries/application/pages/beneficiaries.page").then((module) => ({ default: module.BeneficiariesPage })));
const BeneficiaryDetailPage = lazy(() => import("@/features/beneficiaries/application/pages/beneficiary-detail.page").then((module) => ({ default: module.BeneficiaryDetailPage })));
const QuickPaymentPage = lazy(() => import("@/features/beneficiaries/application/pages/quick-payment.page").then((module) => ({ default: module.QuickPaymentPage })));
const BankAccountsPage = lazy(() => import("@/features/beneficiaries/application/pages/bank-accounts.page").then((module) => ({ default: module.BankAccountsPage })));
const CreditCardMovementsPage = lazy(() => import("@/features/beneficiaries/application/pages/credit-card-movements.page").then((module) => ({ default: module.CreditCardMovementsPage })));
const MetricsPage = lazy(() => import("@/features/metrics/application/pages/metrics.page").then((module) => ({ default: module.MetricsPage })));
const ProfilePage = lazy(() => import("@/features/profile/application/pages/profile.page").then((module) => ({ default: module.ProfilePage })));
const ReportsPage = lazy(() => import("@/features/reports/application/pages/reports.page").then((module) => ({ default: module.ReportsPage })));
const NotificationsPage = lazy(() => import("@/features/notifications/application/pages/notifications.page").then((module) => ({ default: module.NotificationsPage })));
const CompliancePage = lazy(() => import("@/features/compliance/application/pages/compliance.page").then((module) => ({ default: module.CompliancePage })));
const ReviewPaymentPage = lazy(() => import("@/features/compliance/application/pages/review-payment.page").then((module) => ({ default: module.ReviewPaymentPage })));
const FindingReviewPage = lazy(() => import("@/features/compliance/application/pages/finding-review.page").then((module) => ({ default: module.FindingReviewPage })));
const CollectionsPage = lazy(() => import("@/features/collections/application/pages/collections.page").then((module) => ({ default: module.CollectionsPage })));

function guarded(
  permission: string | string[],
  element: ReactNode,
  mode: PermissionMode = "all",
) {
  return (
    <RequirePermission permission={permission} mode={mode}>
      <Suspense fallback={<PageLoader />}>
        {element}
      </Suspense>
    </RequirePermission>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: guarded(PERMISSIONS.DASHBOARD_VIEW, <HomePage />),
      },
      {
        path: "documents",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DocumentsPage />
          </Suspense>
        ),
      },
      {
        path: "documents/create",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateDocumentPage />
          </Suspense>
        ),
      },
      {
        path: "transactions",
        element: guarded(
          [...VIEW_TRANSACTIONS],
          <TransactionsPage />,
          "any",
        ),
      },
      {
        path: "transactions/create",
        element: guarded(PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE, <CreatePaymentPage />),
      },
      {
        path: "transactions/correct/:id",
        element: guarded(PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE, <CorrectPaymentPage />),
      },
      {
        path: "transactions/:paymentId/review",
        element: guarded(
          [
            PERMISSIONS.COMPLIANCE_PENDING_LIST,
            PERMISSIONS.COMPLIANCE_RESOLVE,
            PERMISSIONS.COMPLIANCE_APPROVE,
            PERMISSIONS.COMPLIANCE_REJECT,
            PERMISSIONS.TRANSACTIONS_DETAIL,
          ],
          <ReviewPaymentPage />,
          "any",
        ),
      },
      {
        path: "transactions/:paymentId/novedad",
        element: guarded(
          [
            PERMISSIONS.COMPLIANCE_PENDING_LIST,
            PERMISSIONS.COMPLIANCE_RESOLVE,
            PERMISSIONS.COMPLIANCE_APPROVE,
            PERMISSIONS.COMPLIANCE_REJECT,
            PERMISSIONS.TRANSACTIONS_DETAIL,
          ],
          <FindingReviewPage />,
          "any",
        ),
      },
      {
        path: "batches",
        element: guarded(PERMISSIONS.PAYMENTS_BATCH_LIST, <BatchesPage />),
      },
      {
        path: "batches/create",
        element: guarded(PERMISSIONS.PAYMENTS_BATCH_CREATE, <CreateBatchPage />),
      },
      {
        path: "batches/:id",
        element: guarded(PERMISSIONS.PAYMENTS_BATCH_LIST, <BatchDetailPage />),
      },
      {
        path: "batches/:batchId/transactions/:transactionId",
        element: guarded(PERMISSIONS.PAYMENTS_BATCH_LIST, <TransactionDetailPage />),
      },
      {
        path: "batches/:batchId/transactions/:transactionId/review",
        element: guarded(
          [PERMISSIONS.COMPLIANCE_PENDING_LIST, PERMISSIONS.PAYMENTS_BATCH_LIST],
          <ReviewPaymentPage />,
          "any",
        ),
      },
      {
        path: "batches/:batchId/transactions/:transactionId/novedad",
        element: guarded(
          [PERMISSIONS.COMPLIANCE_PENDING_LIST, PERMISSIONS.PAYMENTS_BATCH_LIST],
          <FindingReviewPage />,
          "any",
        ),
      },
      {
        path: "accounts",
        element: guarded(PERMISSIONS.ACCOUNTS_LIST, <AccountsPage />),
      },
      {
        path: "accounts/:accountId/movements",
        element: guarded(PERMISSIONS.ACCOUNTS_LIST, <AccountMovementsPage />),
      },
      {
        path: "beneficiaries",
        element: guarded(PERMISSIONS.BENEFICIARIES_LIST, <BeneficiariesPage />),
      },
      {
        path: "beneficiaries/:beneficiaryId",
        element: guarded(PERMISSIONS.BENEFICIARIES_LIST, <BeneficiaryDetailPage />),
      },
      {
        path: "beneficiaries/:beneficiaryId/quick-payment",
        element: guarded(PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE, <QuickPaymentPage />),
      },
      {
        path: "beneficiaries/:beneficiaryId/bank-accounts",
        element: guarded(PERMISSIONS.BENEFICIARIES_LIST, <BankAccountsPage />),
      },
      {
        path: "beneficiaries/:beneficiaryId/cards/:cardId/movements",
        element: guarded(PERMISSIONS.BENEFICIARIES_LIST, <CreditCardMovementsPage />),
      },
      {
        path: "metrics",
        element: guarded(PERMISSIONS.METRICS_COUNTRY, <MetricsPage />),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "reports",
        element: guarded(PERMISSIONS.REPORTS_OWN, <ReportsPage />),
      },
      {
        path: "compliance",
        element: guarded(PERMISSIONS.COMPLIANCE_PENDING_LIST, <CompliancePage />),
      },
      {
        path: "collections",
        element: guarded(PERMISSIONS.COLLECTIONS_LIST, <CollectionsPage />),
      },
      {
        path: "notifications",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotificationsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
