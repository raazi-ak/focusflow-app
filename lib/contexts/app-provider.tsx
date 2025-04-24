"use client"

import React from "react"
import { TaskProvider } from "./task-context"
import { ProjectProvider } from "./project-context"
import { SettingsProvider } from "./settings-context"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ProjectProvider>
        <TaskProvider>{children}</TaskProvider>
      </ProjectProvider>
    </SettingsProvider>
  )
}