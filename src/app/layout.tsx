import { AppSidebar } from "@/components/AppSidebar"
import Blobs from "@/components/Blobs"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { auth, currentUser } from "@clerk/nextjs/server"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Rate My Opener",
    template: "%s | Rate My Opener",
  },
  description: "AI-powered dating opener rater",
  metadataBase: new URL("https://ratemyopener.com"),
  openGraph: {
    title: "Rate My Opener",
    description: "AI-powered dating opener rater",
    url: "https://ratemyopener.com",
    siteName: "Rate My Opener",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rate My Opener",
    description: "AI-powered dating opener rater",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body>
          <Analytics />
          <SpeedInsights />
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar userId={userId} firstName={user?.firstName ?? null} />
            <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
              <Blobs />
              <SidebarTrigger className="z-50 absolute top-4 left-4 cursor-pointer text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10 rounded-lg transition-all duration-200" />
              {children}
            </main>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
