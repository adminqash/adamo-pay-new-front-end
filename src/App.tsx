import { FullScreenLoader } from "@adamosuiteservices/ui/full-screen-loader";
import { Toaster } from "@adamosuiteservices/ui/toaster";
import { RouterProvider } from "react-router";
import { GlobalQueryLoader } from "@/features/common/components/layout/global-query-loader";
import { RefetchProgressBar } from "@/features/common/components/layout/refetch-progress-bar";
import { AvatarProvider } from "@/features/common/contexts/avatar-context";
import { router } from "@/router";

function App() {
  return (
    <AvatarProvider>
      <RefetchProgressBar />
      <FullScreenLoader />
      <GlobalQueryLoader />
      <RouterProvider router={router} />
      <Toaster />
    </AvatarProvider>
  );
}

export default App;
