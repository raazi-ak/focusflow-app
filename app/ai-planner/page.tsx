"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, AlertCircle, MessageSquare, ListTodo, CheckCircle2, Plus, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import TaskList from "@/components/task-list"
import type { Task } from "@/lib/types"
import { useTasks } from "@/lib/contexts/task-context"
import { useSettings } from "@/lib/contexts/settings-context"
import { toast } from "sonner"
import { CircularProgress } from "@/components/circular-progress"
import { FileUpload } from "@/components/file-upload"

type ChatMode = "planning" | "general" | "document"

export default function AiPlanner() {
  const { addGeneratedTasks } = useTasks()
  const { settings } = useSettings()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "Hi there! I can help you create a structured plan or answer general questions. What would you like to do today?",
    },
  ])
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>("planning")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // Simulate loading progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 15
          return next > 100 ? 100 : next
        })
      }, 300)
    } else {
      setLoadingProgress(0)
    }
    
    return () => clearInterval(interval)
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Reset error state
    setError(null)
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }])
    setIsLoading(true)
    setLoadingProgress(0)

    try {
      // Call the API route
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${chatMode === "planning" ? "Create a task plan for: " : ""}${input}`,
          apiKey: settings.ai.apiKey,
          mode: chatMode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      // Add assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

      // Set tasks from response if in planning mode
      if (chatMode === "planning" && data.tasks) {
        setGeneratedTasks(data.tasks);
      }
      
      // Show toast if it's a mock response
      if (data.mockResponse) {
        toast.info("Using mock data. Add a Gemini API key in Settings for real AI responses.");
      }
    } catch (err: any) {
      console.error("Error generating tasks:", err);
      setError(err.message || "Failed to generate tasks. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while generating tasks. Please try again or check your API key in Settings.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  }

  const handleAddToMyTasks = () => {
    if (generatedTasks.length > 0) {
      // Add tasks to global task list
      addGeneratedTasks(generatedTasks);
      toast.success(`${generatedTasks.length} tasks added to your task list!`);
    }
  }
  
  const handleModeChange = (value: string) => {
    setChatMode(value as ChatMode);
    
    // Add a system message when changing modes
    if (value === "planning" && chatMode !== "planning") {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'll help you create a structured plan. Describe your day or goals, and I'll break it down into manageable tasks."
        }
      ]);
    } else if (value === "general" && chatMode !== "general") {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm now in general chat mode. Feel free to ask me anything or discuss ideas."
        }
      ]);
      
      // Clear generated tasks when switching to general mode
      setGeneratedTasks([]);
    } else if (value === "document" && chatMode !== "document") {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm now in document analysis mode. Upload an image or PDF, and I'll extract and analyze the text for you."
        }
      ]);
      
      // Clear generated tasks when switching to document mode
      setGeneratedTasks([]);
    }
  }
  
  const getPlaceholderText = () => {
    if (chatMode === "planning") {
      return "Describe your day or goals for a structured plan...";
    } else if (chatMode === "general") {
      return "Ask me anything...";
    } else {
      return "Ask questions about the uploaded document...";
    }
  }
  
  const handleTextExtracted = (text: string) => {
    // Add the extracted text as a user message
    setMessages(prev => [
      ...prev,
      { 
        role: "user", 
        content: `I've uploaded a document with the following content:\n\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`
      }
    ]);
    
    // Simulate AI analyzing the document
    setIsLoading(true);
    setLoadingProgress(0);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I've analyzed the document. What would you like to know about it? You can ask me to summarize it, extract key points, or ask specific questions about its content."
        }
      ]);
      setIsLoading(false);
    }, 2000);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full max-w-6xl mx-auto p-6"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col space-y-2 mb-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">AI Planner</h1>
        <p className="text-muted-foreground">
          Describe your day or goals in natural language, and I'll create a structured plan for you.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-220px)]">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col bg-card rounded-lg shadow-sm overflow-hidden border"
        >
          <CardHeader className="px-6 pt-6 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle>AI Assistant</CardTitle>
              <Tabs 
                defaultValue="planning" 
                value={chatMode} 
                onValueChange={handleModeChange}
                className="w-auto"
              >
                <TabsList className="grid w-[360px] grid-cols-3">
                  <TabsTrigger value="planning" className="flex items-center gap-1">
                    <ListTodo className="h-4 w-4" />
                    Task Planning
                  </TabsTrigger>
                  <TabsTrigger value="general" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    General Chat
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Document Analysis
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-accent-color text-accent-color-foreground chat-message-user" 
                        : "bg-muted chat-message-ai"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex justify-start"
              >
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8">
                      <CircularProgress 
                        value={loadingProgress} 
                        max={100} 
                        size={32} 
                        strokeWidth={4} 
                        showText={false}
                        animate={true}
                      />
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {chatMode === "document" ? (
            <div className="p-4 border-t">
              <FileUpload 
                onTextExtracted={handleTextExtracted} 
                accentColor={settings.appearance.accentColor}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholderText()}
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()}
                    className="bg-accent-color hover:bg-accent-color/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-[350px] bg-card rounded-lg shadow-sm overflow-hidden border"
        >
          <CardHeader className="px-6 pt-6 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle>Generated Tasks</CardTitle>
              {generatedTasks.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    onClick={handleAddToMyTasks}
                    className="bg-accent-color hover:bg-accent-color/90 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add to My Tasks
                  </Button>
                </motion.div>
              )}
            </div>
          </CardHeader>
          
          <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-destructive py-4"
                >
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              ) : generatedTasks.length > 0 ? (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TaskList tasks={generatedTasks} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-muted-foreground py-8 flex flex-col items-center"
                >
                  <ListTodo className="h-12 w-12 mb-4 text-muted-foreground animate-pulse-subtle" />
                  <p>No tasks generated yet. Describe your day to get started!</p>
                  
                  {chatMode === "planning" && (
                    <div className="mt-6 space-y-2 max-w-md mx-auto">
                      <div className="flex items-start">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                        <p className="text-sm text-muted-foreground text-left">Try "I need to prepare for a client presentation tomorrow and also finish my quarterly report."</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                        <p className="text-sm text-muted-foreground text-left">Or "Help me plan my weekend with a mix of chores and relaxation activities."</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}