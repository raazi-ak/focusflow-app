"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Task } from "@/lib/types"
import { mockTasks } from "@/lib/mock-data"

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (task: Task) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  addGeneratedTasks: (tasks: Omit<Task, "id">[]) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  
  // Load tasks from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    } else {
      // Use mock data for initial state if no stored tasks
      setTasks(mockTasks)
      localStorage.setItem("tasks", JSON.stringify(mockTasks))
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const addGeneratedTasks = (generatedTasks: Omit<Task, "id">[]) => {
    const newTasks = generatedTasks.map((task) => ({
      ...task,
      id: uuidv4(),
    }))
    setTasks((prevTasks) => [...prevTasks, ...newTasks])
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addGeneratedTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}