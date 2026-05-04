import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-6">{children}</main>
      </div>
    </div>
  );
}
