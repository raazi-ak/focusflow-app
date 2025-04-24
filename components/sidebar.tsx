"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Sparkles, FolderKanban, Timer, Settings, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "AI Planner",
    href: "/ai-planner",
    icon: Sparkles,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Focus Mode",
    href: "/focus-mode",
    icon: Timer,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card md:relative md:flex md:flex-col",
          isOpen ? "flex flex-col" : "hidden md:flex md:flex-col",
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span>FocusFlow</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === item.href
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none">Alex Johnson</p>
              <p className="text-xs text-muted-foreground truncate">alex@example.com</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
