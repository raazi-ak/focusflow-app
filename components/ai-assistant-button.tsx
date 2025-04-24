"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, X, AlertCircle, Send, MessageSquare, ListTodo, CheckCircle2, Plus, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import TaskList from "@/components/task-list"
import { useTasks } from "@/lib/contexts/task-context"
import { useSettings } from "@/lib/contexts/settings-context"
import { toast } from "sonner"
import type { Task } from "@/lib/types"
import { CircularProgress } from "@/components/circular-progress"
import { FileUpload } from "@/components/file-upload"

type ChatMode = "planning" | "general" | "document"
type Message = { role: "user" | "assistant"; content: string }

export default function AiAssistantButton() {
  const { addGeneratedTasks } = useTasks()
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I can help you create a structured plan or answer general questions. What would you like to do today?"
    }
  ])
  const [chatMode, setChatMode] = useState<ChatMode>("planning")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])
  
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
    const userMessage = { role: "user" as const, content: input }
    setMessages(prev => [...prev, userMessage])
    
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
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      
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
      setMessages(prev => [
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
      
      // Add a confirmation message
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: `Great! I've added ${generatedTasks.length} tasks to your task list. Is there anything else you'd like help with?` 
        }
      ]);
      
      // Clear generated tasks but keep the chat history
      setGeneratedTasks([]);
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
  
  const handleClose = () => {
    setIsOpen(false);
  }
  
  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi there! I can help you create a structured plan or answer general questions. What would you like to do today?"
      }
    ]);
    setGeneratedTasks([]);
    setInput("");
    setError(null);
    setChatMode("planning");
  }

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          className="fixed bottom-6 right-6 rounded-full shadow-lg bg-accent-color hover:bg-accent-color/90" 
          size="icon" 
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-3xl bg-card rounded-lg shadow-lg border overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <div className="flex items-center space-x-2">
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 h-[70vh]">
                <div className="flex flex-col border-r">
                  <div className="flex-1 overflow-auto p-4 space-y-4 chat-messages">
                    <AnimatePresence initial={false}>
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[90%] ${
                              message.role === "user"
                                ? "chat-message-user"
                                : "chat-message-ai"
                            }`}
                          >
                            {message.content}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center space-x-2">
                          <div className="w-8 h-8">
                            <CircularProgress 
                              value={loadingProgress} 
                              max={100} 
                              size={32} 
                              strokeWidth={4} 
                              showText={false}
                              color={settings.appearance.accentColor}
                              animate={true}
                            />
                          </div>
                          <span>Thinking...</span>
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
                    <div className="p-4 border-t">
                      <form onSubmit={handleSubmit} className="flex space-x-2">
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
                      </form>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Generated Tasks</h3>
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
                  
                  <div className="flex-1 overflow-auto p-4">
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
                        {chatMode === "planning" ? (
                          <>
                            <ListTodo className="h-12 w-12 mb-4 text-muted-foreground animate-pulse-subtle" />
                            <p>No tasks generated yet. Describe your day to get started!</p>
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
                          </>
                        ) : chatMode === "general" ? (
                          <>
                            <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground animate-pulse-subtle" />
                            <p>Ask me anything to get started!</p>
                            <div className="mt-6 space-y-2 max-w-md mx-auto">
                              <div className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                                <p className="text-sm text-muted-foreground text-left">Try "What are some effective time management techniques?"</p>
                              </div>
                              <div className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                                <p className="text-sm text-muted-foreground text-left">Or "How can I stay motivated while working on long-term projects?"</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <FileText className="h-12 w-12 mb-4 text-muted-foreground animate-pulse-subtle" />
                            <p>Upload a document to get started!</p>
                            <div className="mt-6 space-y-2 max-w-md mx-auto">
                              <div className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                                <p className="text-sm text-muted-foreground text-left">Upload an image or PDF document to extract and analyze its text.</p>
                              </div>
                              <div className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-accent-color mt-0.5" />
                                <p className="text-sm text-muted-foreground text-left">You can then ask questions about the document or request a summary.</p>
                              </div>
                            </div>
                          </>
                        )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="p-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="w-full"
                    >
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}