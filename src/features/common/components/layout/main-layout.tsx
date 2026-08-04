import { MainSidebar } from "@/features/common/components/layout/main-sidebar";
import { ScrollToTop } from "@/features/common/components/layout/scroll-to-top";
import { SuiteHeader } from "@/features/common/components/suite-header/suite-header";

export function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <SuiteHeader />
      <MainSidebar />
    </>
  );
}
