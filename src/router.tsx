import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/features/common/components/layout/main-layout";
import { PageLoader } from "@/features/common/components/layout/page-loader";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionsPage />
          </Suspense>
        ),
      },
      {
        path: "transactions/create",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreatePaymentPage />
          </Suspense>
        ),
      },
      {
        path: "transactions/correct/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CorrectPaymentPage />
          </Suspense>
        ),
      },
      {
        path: "batches",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchesPage />
          </Suspense>
        ),
      },
      {
        path: "batches/create",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateBatchPage />
          </Suspense>
        ),
      },
      {
        path: "batches/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchDetailPage />
          </Suspense>
        ),
      },
      {
        path: "batches/:batchId/transactions/:transactionId",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionDetailPage />
          </Suspense>
        ),
      },
      {
        path: "accounts",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccountsPage />
          </Suspense>
        ),
      },
      {
        path: "accounts/:accountId/movements",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccountMovementsPage />
          </Suspense>
        ),
      },
      {
        path: "beneficiaries",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BeneficiariesPage />
          </Suspense>
        ),
      },
      {
        path: "beneficiaries/:beneficiaryId",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BeneficiaryDetailPage />
          </Suspense>
        ),
      },
      {
        path: "beneficiaries/:beneficiaryId/quick-payment",
        element: (
          <Suspense fallback={<PageLoader />}>
            <QuickPaymentPage />
          </Suspense>
        ),
      },
      {
        path: "beneficiaries/:beneficiaryId/bank-accounts",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BankAccountsPage />
          </Suspense>
        ),
      },
      {
        path: "beneficiaries/:beneficiaryId/cards/:cardId/movements",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreditCardMovementsPage />
          </Suspense>
        ),
      },
      {
        path: "metrics",
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetricsPage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportsPage />
          </Suspense>
        ),
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
