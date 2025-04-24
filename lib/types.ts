export interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  estimatedTime: string
  timeSlot?: string
  dueDate: string
  completed: boolean
  projectId?: string
  subtasks?: {
    title: string
    completed: boolean
  }[]
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  totalTasks: number
  completedTasks: number
}

export interface LlmResponse {
  message: string
  tasks: Task[]
}
