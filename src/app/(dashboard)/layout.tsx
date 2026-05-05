import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen relative"
      style={{
        backgroundImage: "url('/fondoMecanica.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay temático — casi opaco para no distraer del UI */}
      <div className="absolute inset-0 bg-background/93 pointer-events-none" />

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1 md:ml-64">
          <MobileHeader />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
