import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/features/common/components/layout/main-layout";
import { PageLoader } from "@/features/common/components/layout/page-loader";

const DocumentsPage = lazy(() => import("@/features/documents/application/pages/documents.page").then((module) => ({ default: module.DocumentsPage })));
const CreateDocumentPage = lazy(() => import("@/features/documents/application/pages/create-document.page").then((module) => ({ default: module.CreateDocumentPage })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
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
    ],
  },
]);
