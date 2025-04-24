"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Project } from "@/lib/types"
import { mockProjects } from "@/lib/mock-data"

interface ProjectContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id">) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
  updateProjectProgress: (id: string, totalTasks: number, completedTasks: number) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  
  // Load projects from localStorage on initial render
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects")
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    } else {
      // Use mock data for initial state if no stored projects
      setProjects(mockProjects)
      localStorage.setItem("projects", JSON.stringify(mockProjects))
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects))
    }
  }, [projects])

  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
    }
    setProjects((prevProjects) => [...prevProjects, newProject])
  }

  const updateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id))
  }

  const updateProjectProgress = (id: string, totalTasks: number, completedTasks: number) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, totalTasks, completedTasks } : project
      )
    )
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        updateProjectProgress,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}