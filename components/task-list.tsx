import type { Task } from "@/lib/types"
import TaskCard from "@/components/task-card"

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
  // Group tasks by priority
  const highPriorityTasks = tasks.filter((task) => task.priority === "high")
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium")
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low")

  return (
    <div className="space-y-6">
      {highPriorityTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">High Priority</h3>
          <div className="space-y-2">
            {highPriorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      )}

      {mediumPriorityTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Medium Priority</h3>
          <div className="space-y-2">
            {mediumPriorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      )}

      {lowPriorityTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Low Priority</h3>
          <div className="space-y-2">
            {lowPriorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && <div className="text-center text-muted-foreground py-8">No tasks available</div>}
    </div>
  )
}
