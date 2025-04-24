"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/types"
import { Clock, ArrowUp, ArrowRight, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTasks } from "@/lib/contexts/task-context"

interface TaskCardProps {
  task: Task
  compact?: boolean
  onClick?: () => void
}

export default function TaskCard({ task, compact = false, onClick }: TaskCardProps) {
  const { toggleTaskCompletion } = useTasks()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCheckboxChange = (checked: boolean) => {
    toggleTaskCompletion(task.id)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case "medium":
        return <ArrowRight className="h-3 w-3 text-amber-500" />
      case "low":
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "High"
      case "medium":
        return "Medium"
      case "low":
        return "Low"
      default:
        return "None"
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (!compact) setIsExpanded(!isExpanded)
        if (onClick) onClick()
      }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 cursor-pointer",
          task.completed && "opacity-60",
          onClick && "hover:border-primary/50",
        )}
      >
        <CardContent className={cn("p-4", compact ? "space-y-1" : "space-y-2")}>
          <div className="flex items-start gap-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium leading-none",
                  compact ? "text-sm" : "text-base",
                  task.completed && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              {!compact && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
            </div>
          </div>

          {(!compact || isExpanded) && task.subtasks && task.subtasks.length > 0 && (
            <motion.div
              className="pl-6 mt-2 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {task.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox id={`subtask-${task.id}-${index}`} checked={subtask.completed} className="h-3.5 w-3.5" />
                  <label
                    htmlFor={`subtask-${task.id}-${index}`}
                    className={cn("text-xs", subtask.completed && "line-through text-muted-foreground")}
                  >
                    {subtask.title}
                  </label>
                </div>
              ))}
            </motion.div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedTime}</span>
              </div>
              {task.timeSlot && !compact && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">{task.timeSlot}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {getPriorityIcon(task.priority)}
              <span>{getPriorityText(task.priority)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
