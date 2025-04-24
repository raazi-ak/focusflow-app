import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { AppProvider } from "@/lib/contexts/app-provider"
import { AccentColorProvider } from "@/components/accent-color-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FocusFlow | Smart Task Planning",
  description: "AI-powered task planning for maximum productivity",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            <AccentColorProvider>
              <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
              <Toaster />
            </AccentColorProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
