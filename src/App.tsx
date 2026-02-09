import { FullScreenLoader } from "@adamosuiteservices/ui/full-screen-loader";
import { Toaster } from "@adamosuiteservices/ui/toaster";
import { RouterProvider } from "react-router";
import { GlobalQueryLoader } from "@/features/common/components/layout/global-query-loader";
import { RefetchProgressBar } from "@/features/common/components/layout/refetch-progress-bar";
import { router } from "@/router";

function App() {
  return (
    <>
      <RefetchProgressBar />
      <FullScreenLoader />
      <GlobalQueryLoader />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
