"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, CheckCircle2, Trophy, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import TaskCard from "@/components/task-card"
import AiAssistantButton from "@/components/ai-assistant-button"
import { useTasks } from "@/lib/contexts/task-context"
import { useSettings } from "@/lib/contexts/settings-context"
import { toast } from "sonner"
import { CircularProgress } from "@/components/circular-progress"

export default function FocusMode() {
  const { tasks, toggleTaskCompletion } = useTasks()
  const { settings } = useSettings()
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [focusLength, setFocusLength] = useState(25)
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)

  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Get current task object
  const currentTaskObject = currentTask 
    ? tasks.find(task => task.id === currentTask) 
    : incompleteTasks.length > 0 ? incompleteTasks[0] : null;

  // Initialize current task if not set and there are incomplete tasks
  useEffect(() => {
    if (!currentTask && incompleteTasks.length > 0) {
      setCurrentTask(incompleteTasks[0].id);
    }
  }, [currentTask, incompleteTasks]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
        // Increment total focus time
        setTotalFocusTime(prev => prev + 1);
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      setIsActive(false)
      setCompletedSessions(prev => prev + 1)
      
      // Show notification
      if (settings.notifications.enabled) {
        toast.success("Focus session completed! Take a short break.", {
          duration: 5000,
          action: {
            label: "Start New Session",
            onClick: () => resetTimer()
          }
        });
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, settings.notifications.enabled])

  const toggleTimer = () => {
    setIsActive(!isActive)
    
    // Show toast when starting timer
    if (!isActive) {
      toast.info(`Focus session started: ${focusLength} minutes`, {
        duration: 2000,
      });
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(focusLength * 60)
  }

  const handleFocusLengthChange = (value: number[]) => {
    setFocusLength(value[0])
    setTimeLeft(value[0] * 60)
  }

  const handleTaskComplete = () => {
    if (currentTask && currentTaskObject) {
      toggleTaskCompletion(currentTask);
      toast.success("Task marked as completed!", {
        description: "Great job! Moving to the next task."
      });
      
      // Select next incomplete task if available
      const nextIncompleteTasks = incompleteTasks.filter(task => task.id !== currentTask);
      if (nextIncompleteTasks.length > 0) {
        setCurrentTask(nextIncompleteTasks[0].id);
      } else {
        setCurrentTask(null);
      }
    }
  }

  const selectTask = (taskId: string) => {
    setCurrentTask(taskId);
    toast.info("Task selected for focus");
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  // Format total time as Xh XXm
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
        <p className="text-muted-foreground">Eliminate distractions and focus on one task at a time.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col space-y-6"
        >
          <Card className="overflow-hidden">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-64 h-64">
                    <CircularProgress
                      value={timeLeft}
                      max={focusLength * 60}
                      size={256}
                      strokeWidth={8}
                      showText={false}
                      animate={isActive}
                      color={settings.appearance.accentColor}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        className="text-4xl font-bold"
                        key={timeLeft}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {formatTime(timeLeft)}
                      </motion.span>
                      <span className="text-sm text-muted-foreground">Focus Time</span>
                      <div className="text-xs text-muted-foreground mt-2">
                        <span className="inline-flex items-center">
                          <Trophy className="h-3 w-3 mr-1" /> 
                          Sessions: {completedSessions}
                        </span>
                        <span className="mx-2">|</span>
                        <span className="inline-flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> 
                          Total: {formatTotalTime(totalFocusTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant={isActive ? "outline" : "default"} 
                        size="icon" 
                        className={`h-12 w-12 rounded-full ${!isActive ? `bg-${settings.appearance.accentColor}` : ""}`} 
                        onClick={toggleTimer}
                      >
                        {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full" 
                        onClick={resetTimer}
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Focus Length: {focusLength} min</span>
                    </div>
                    <Slider
                      value={[focusLength]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={handleFocusLengthChange}
                      disabled={isActive}
                      className={`accent-${settings.appearance.accentColor}`}
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          </Card>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Current Focus</h2>
                  <AnimatePresence>
                    {currentTaskObject && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleTaskComplete}
                          className={`flex items-center gap-1 border-${settings.appearance.accentColor} text-${settings.appearance.accentColor}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <AnimatePresence mode="wait">
                  {currentTaskObject ? (
                    <motion.div
                      key={currentTaskObject.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TaskCard task={currentTaskObject} compact />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-muted-foreground py-4"
                    >
                      <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-pulse-subtle" />
                      No active tasks. Add a task or select one from below.
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Up Next</h2>
              <AnimatePresence>
                {incompleteTasks.filter(task => task.id !== currentTask).length > 0 ? (
                  <div className="space-y-4">
                    {incompleteTasks
                      .filter(task => task.id !== currentTask)
                      .slice(0, 4)
                      .map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ 
                            scale: 1.02, 
                            backgroundColor: "rgba(var(--accent), 0.05)",
                            transition: { duration: 0.2 }
                          }}
                          className="cursor-pointer rounded-md p-1"
                          onClick={() => selectTask(task.id)}
                        >
                          <TaskCard 
                            task={task} 
                            compact 
                          />
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-4"
                  >
                    No more tasks available. Great job!
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Focus Tips</h2>
                <ul className="space-y-2 text-sm">
                  {[
                    "Break down large tasks into smaller, manageable chunks.",
                    "Use the Pomodoro technique: 25 minutes of focus followed by a 5-minute break.",
                    "Eliminate distractions by silencing notifications and closing unnecessary tabs.",
                    "Stay hydrated and take short breaks to maintain productivity."
                  ].map((tip, index) => (
                    <motion.li 
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index + 0.5 }}
                      className="flex items-start"
                    >
                      <span className={`bg-${settings.appearance.accentColor}/10 text-${settings.appearance.accentColor} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <AiAssistantButton />
    </motion.div>
  )
}
