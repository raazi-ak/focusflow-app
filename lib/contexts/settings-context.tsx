"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface Settings {
  notifications: {
    enabled: boolean
    soundEffects: boolean
    focusReminders: boolean
    reminderTime: string
  }
  appearance: {
    fontSize: number
    animations: boolean
    accentColor: string
    use24HourFormat: boolean
  }
  ai: {
    model: string
    apiKey: string
    enableSuggestions: boolean
    enablePrioritization: boolean
    enableTimeEstimates: boolean
    responseLength: number
  }
  profile: {
    name: string
    email: string
    bio: string
    timeZone: string
  }
}

const defaultSettings: Settings = {
  notifications: {
    enabled: true,
    soundEffects: true,
    focusReminders: true,
    reminderTime: "15"
  },
  appearance: {
    fontSize: 16,
    animations: true,
    accentColor: "violet",
    use24HourFormat: false
  },
  ai: {
    model: "gemini",
    apiKey: "",
    enableSuggestions: true,
    enablePrioritization: true,
    enableTimeEstimates: true,
    responseLength: 50
  },
  profile: {
    name: "Alex Johnson",
    email: "alex@example.com",
    bio: "Product designer and developer",
    timeZone: "america-new_york"
  }
}

interface SettingsContextType {
  settings: Settings
  updateSettings: <K extends keyof Settings>(
    category: K,
    newValues: Partial<Settings[K]>
  ) => void
  updateApiKey: (apiKey: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  
  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedSettings = localStorage.getItem("settings")
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    } else {
      // Use default settings if no stored settings
      setSettings(defaultSettings)
      localStorage.setItem("settings", JSON.stringify(defaultSettings))
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = <K extends keyof Settings>(
    category: K,
    newValues: Partial<Settings[K]>
  ) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        ...newValues
      }
    }))
  }

  const updateApiKey = (apiKey: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ai: {
        ...prevSettings.ai,
        apiKey
      }
    }))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiKey
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}