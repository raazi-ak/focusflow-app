"use client"

import { useEffect } from "react"
import { useSettings } from "@/lib/contexts/settings-context"
import { applyAccentColor } from "@/lib/utils"

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  
  useEffect(() => {
    // Apply accent color to document root
    if (typeof document !== "undefined") {
      applyAccentColor(document.documentElement, settings.appearance.accentColor)
      
      // Add a data attribute for CSS selectors
      document.documentElement.setAttribute("data-accent-color", settings.appearance.accentColor)
    }
  }, [settings.appearance.accentColor])
  
  return <>{children}</>
}