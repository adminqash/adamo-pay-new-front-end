import { FullScreenLoader } from "@adamosuiteservices/ui/full-screen-loader";
import { Toaster } from "@adamosuiteservices/ui/toaster";
import { RouterProvider } from "react-router";
import { AuthProvider } from "@/features/auth/application/contexts/auth.context";
import { AccessProvider } from "@/features/auth/application/contexts/access.context";
import { GlobalQueryLoader } from "@/features/common/components/layout/global-query-loader";
import { RefetchProgressBar } from "@/features/common/components/layout/refetch-progress-bar";
import { AvatarProvider } from "@/features/common/contexts/avatar-context";
import { CountryProvider } from "@/features/common/contexts/country-context";
import { router } from "@/router";

function App() {
  return (
    <AuthProvider>
      <AccessProvider>
        <CountryProvider>
        <AvatarProvider>
          <RefetchProgressBar />
          <FullScreenLoader />
          <GlobalQueryLoader />
          <RouterProvider router={router} />
          <Toaster />
        </AvatarProvider>
        </CountryProvider>
      </AccessProvider>
    </AuthProvider>
  );
}

export default App;
