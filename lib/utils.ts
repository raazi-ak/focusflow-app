import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color mapping for accent colors
type AccentColor = 
  | "rose" | "orange" | "emerald" | "sky" 
  | "violet" | "pink" | "blue" | "red" 
  | "green" | "yellow" | "purple" | "indigo"

// CSS variable names
type CssVariable = 
  | "--accent" 
  | "--accent-foreground" 
  | "--accent-muted" 
  | "--accent-emphasis"

// Color values for each accent color
const colorValues: Record<AccentColor, Record<CssVariable, string>> = {
  rose: {
    "--accent": "rgb(244, 63, 94)", // rose-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(253, 232, 232)", // rose-100
    "--accent-emphasis": "rgb(225, 29, 72)" // rose-600
  },
  orange: {
    "--accent": "rgb(249, 115, 22)", // orange-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(255, 237, 213)", // orange-100
    "--accent-emphasis": "rgb(234, 88, 12)" // orange-600
  },
  emerald: {
    "--accent": "rgb(16, 185, 129)", // emerald-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(209, 250, 229)", // emerald-100
    "--accent-emphasis": "rgb(5, 150, 105)" // emerald-600
  },
  sky: {
    "--accent": "rgb(14, 165, 233)", // sky-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(224, 242, 254)", // sky-100
    "--accent-emphasis": "rgb(2, 132, 199)" // sky-600
  },
  violet: {
    "--accent": "rgb(139, 92, 246)", // violet-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(237, 233, 254)", // violet-100
    "--accent-emphasis": "rgb(124, 58, 237)" // violet-600
  },
  pink: {
    "--accent": "rgb(236, 72, 153)", // pink-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(252, 231, 243)", // pink-100
    "--accent-emphasis": "rgb(219, 39, 119)" // pink-600
  },
  blue: {
    "--accent": "rgb(59, 130, 246)", // blue-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(219, 234, 254)", // blue-100
    "--accent-emphasis": "rgb(37, 99, 235)" // blue-600
  },
  red: {
    "--accent": "rgb(239, 68, 68)", // red-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(254, 226, 226)", // red-100
    "--accent-emphasis": "rgb(220, 38, 38)" // red-600
  },
  green: {
    "--accent": "rgb(34, 197, 94)", // green-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(220, 252, 231)", // green-100
    "--accent-emphasis": "rgb(22, 163, 74)" // green-600
  },
  yellow: {
    "--accent": "rgb(234, 179, 8)", // yellow-500
    "--accent-foreground": "black",
    "--accent-muted": "rgb(254, 249, 195)", // yellow-100
    "--accent-emphasis": "rgb(202, 138, 4)" // yellow-600
  },
  purple: {
    "--accent": "rgb(168, 85, 247)", // purple-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(243, 232, 255)", // purple-100
    "--accent-emphasis": "rgb(147, 51, 234)" // purple-600
  },
  indigo: {
    "--accent": "rgb(99, 102, 241)", // indigo-500
    "--accent-foreground": "white",
    "--accent-muted": "rgb(224, 231, 255)", // indigo-100
    "--accent-emphasis": "rgb(79, 70, 229)" // indigo-600
  }
}

// Get CSS variables for a given accent color
export function getAccentColorVariables(accentColor: string): Record<string, string> {
  // Default to violet if the accent color is not recognized
  const color = colorValues[accentColor as AccentColor] || colorValues.violet
  return color
}

// Apply accent color CSS variables to an element
export function applyAccentColor(element: HTMLElement, accentColor: string): void {
  const variables = getAccentColorVariables(accentColor)
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value)
  })
}

// Get a CSS class for a specific accent color
export function getAccentColorClass(accentColor: string): string {
  return `accent-${accentColor}`
}
