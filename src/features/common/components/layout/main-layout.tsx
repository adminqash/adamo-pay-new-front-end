import { MainSidebar } from "@/features/common/components/layout/main-sidebar";
import { ScrollToTop } from "@/features/common/components/layout/scroll-to-top";

export function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <MainSidebar />
    </>
  );
}
