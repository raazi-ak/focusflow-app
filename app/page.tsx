"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import TaskCard from "@/components/task-card"
import AiAssistantButton from "@/components/ai-assistant-button"
import { useTasks } from "@/lib/contexts/task-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function Home() {
  const { tasks, addTask } = useTasks()
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    estimatedTime: "",
    dueDate: "today"
  })

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Get yesterday's stats (mock for now)
  const yesterdayTasks = totalTasks - 2
  const yesterdayCompletionRate = 62

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as "high" | "medium" | "low",
      estimatedTime: newTask.estimatedTime || "1 hour",
      dueDate: newTask.dueDate,
      completed: false
    });

    // Reset form and close dialog
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      estimatedTime: "",
      dueDate: "today"
    });
    setIsAddTaskDialogOpen(false);
    toast.success("Task added successfully");
  };
  return (
    <div className="flex flex-col p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your tasks.</p>
          </div>
          <Button 
            variant="default" 
            className="bg-accent-color hover:bg-accent-color/90"
            onClick={() => window.location.href = "/ai-planner"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4 mr-2"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            Generate a Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > yesterdayTasks 
                ? `+${totalTasks - yesterdayTasks} from yesterday` 
                : totalTasks < yesterdayTasks 
                  ? `-${yesterdayTasks - totalTasks} from yesterday`
                  : "Same as yesterday"}
            </p>
            <Progress value={totalTasks > 0 ? 100 : 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            <Progress value={completionRate} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 24m</div>
            <p className="text-xs text-muted-foreground">+45m from yesterday</p>
            <Progress value={60} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% from yesterday</p>
            <Progress value={85} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Today's Tasks</h2>
            <Button size="sm" onClick={() => setIsAddTaskDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks
              .filter((task) => task.dueDate === "today" && !task.completed)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            <Button size="sm" onClick={() => setIsAddTaskDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks
              .filter((task) => task.dueDate === "upcoming" && !task.completed)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Completed Tasks</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks
              .filter((task) => task.completed)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <AiAssistantButton />

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input 
                  id="estimatedTime" 
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  placeholder="e.g., 30 min, 2 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Select 
                value={newTask.dueDate}
                onValueChange={(value) => setNewTask({...newTask, dueDate: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
