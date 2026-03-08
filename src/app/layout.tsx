import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Blobs from "@/components/Blobs";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Rate My Opener",
  description: "AI-powered dating opener rater",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
              <Blobs />
              <SidebarTrigger className="z-50 absolute top-4 left-4 bg-white" />
              {children}
            </main>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
