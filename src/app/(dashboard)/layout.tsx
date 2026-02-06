import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/shared/command-palette";
import { ToastContainer } from "@/components/shared/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-canvas">
        <Sidebar />

        {/* Main content area */}
        <main className="lg:ml-64 transition-all duration-300">
          <TopBar />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>

        <MobileNav />
        <CommandPalette />
        <ToastContainer />
      </div>
    </Providers>
  );
}
