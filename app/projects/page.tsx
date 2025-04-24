"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Folder } from "lucide-react"
import AiAssistantButton from "@/components/ai-assistant-button"
import { useProjects } from "@/lib/contexts/project-context"
import { useTasks } from "@/lib/contexts/task-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function Projects() {
  const { projects, addProject } = useProjects()
  const { tasks, addTask } = useTasks()
  const [activeFilter, setActiveFilter] = useState("all")
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#3b82f6" // Default blue color
  })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    estimatedTime: "",
    dueDate: "upcoming"
  })

  // Filter projects based on active filter
  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return project.completedTasks < project.totalTasks;
    if (activeFilter === "completed") return project.completedTasks === project.totalTasks && project.totalTasks > 0;
    return true;
  });

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    addProject({
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      totalTasks: 0,
      completedTasks: 0
    });

    // Reset form and close dialog
    setNewProject({
      name: "",
      description: "",
      color: "#3b82f6"
    });
    setIsNewProjectDialogOpen(false);
    toast.success("Project created successfully");
  };

  const handleAddTaskToProject = () => {
    if (!newTask.title.trim() || !selectedProject) {
      toast.error("Task title and project are required");
      return;
    }

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority as "high" | "medium" | "low",
      estimatedTime: newTask.estimatedTime || "1 hour",
      dueDate: newTask.dueDate,
      completed: false,
      projectId: selectedProject
    });

    // Reset form and close dialog
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      estimatedTime: "",
      dueDate: "upcoming"
    });
    setSelectedProject(null);
    setIsAddTaskDialogOpen(false);
    toast.success("Task added to project");
  };

  const openAddTaskDialog = (projectId: string) => {
    setSelectedProject(projectId);
    setIsAddTaskDialogOpen(true);
  };
  return (
    <div className="flex flex-col p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Manage your projects and organize related tasks.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={activeFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === "active" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveFilter("active")}
          >
            Active
          </Button>
          <Button 
            variant={activeFilter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveFilter("completed")}
          >
            Completed
          </Button>
        </div>
        <Button onClick={() => setIsNewProjectDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {filteredProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="h-3" style={{ backgroundColor: project.color }} />
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-medium">{project.totalTasks} tasks</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium">{project.completedTasks} completed</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-medium">{Math.round((project.completedTasks / project.totalTasks) * 100)}%</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openAddTaskDialog(project.id)}
                >
                  Add Task
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {activeFilter === "all" 
              ? "You haven't created any projects yet." 
              : activeFilter === "active" 
                ? "You don't have any active projects." 
                : "You don't have any completed projects."}
          </p>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      <AiAssistantButton />

      {/* New Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input 
                id="name" 
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Project description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex space-x-2">
                {["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${
                      newProject.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewProject({...newProject, color})}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task to Project Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task to Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input 
                id="taskTitle" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea 
                id="taskDescription" 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select 
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTaskToProject}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
