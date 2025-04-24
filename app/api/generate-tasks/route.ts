import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Task } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

type ChatMode = "planning" | "general"

// Helper function to parse tasks from the AI response
function parseTasksFromResponse(text: string): Task[] {
  try {
    // Look for a JSON array in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedTasks = JSON.parse(jsonMatch[0]);
      
      // Validate and format tasks
      return parsedTasks.map((task: any) => ({
        id: uuidv4(),
        title: task.title || "Untitled Task",
        description: task.description || "",
        priority: ["high", "medium", "low"].includes(task.priority) ? task.priority : "medium",
        estimatedTime: task.estimatedTime || "1 hour",
        timeSlot: task.timeSlot || undefined,
        dueDate: task.dueDate || "today",
        completed: false,
        subtasks: Array.isArray(task.subtasks) 
          ? task.subtasks.map((st: any) => ({
              title: st.title || "Untitled Subtask",
              completed: Boolean(st.completed)
            }))
          : undefined
      }));
    }
    
    // Fallback: Create a simple task if no JSON found
    return [{
      id: uuidv4(),
      title: "Review AI response",
      description: "The AI generated a response but it couldn't be parsed into tasks. Please review the message.",
      priority: "medium",
      estimatedTime: "15 min",
      dueDate: "today",
      completed: false
    }];
  } catch (error) {
    console.error("Error parsing tasks from AI response:", error);
    return [{
      id: uuidv4(),
      title: "Error parsing AI response",
      description: "There was an error processing the AI response. Please try again with a clearer description.",
      priority: "high",
      estimatedTime: "10 min",
      dueDate: "today",
      completed: false
    }];
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, apiKey, mode = "planning" } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    
    // Use API key from request or environment variable
    const genAI = new GoogleGenerativeAI(
      apiKey || process.env.GEMINI_API_KEY || ""
    );
    
    if (!apiKey && !process.env.GEMINI_API_KEY) {
      // Return mock response based on mode
      if (mode === "planning") {
        return NextResponse.json(
          { 
            error: "API key is required. Please provide it in the settings.",
            mockResponse: true,
            message: "This is a mock response as no API key was provided. In a real implementation, you would need to provide a Gemini API key.",
            tasks: [
              {
                id: uuidv4(),
                title: "Set up Gemini API key",
                description: "Go to Settings > AI Assistant and add your Gemini API key to enable AI task generation.",
                priority: "high",
                estimatedTime: "5 min",
                dueDate: "today",
                completed: false
              }
            ]
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { 
            error: "API key is required. Please provide it in the settings.",
            mockResponse: true,
            message: "This is a mock response as no API key was provided. In a real implementation, you would need to provide a Gemini API key. You can add your Gemini API key in Settings > AI Assistant."
          },
          { status: 200 }
        );
      }
    }
    
    try {
      // Create the model and generate content
      // Try with gemini-1.5-pro first
      const modelName = "gemini-1.5-pro";
      const model = genAI.getGenerativeModel({ model: modelName });
      
      let fullPrompt: string;
      
      if (mode === "planning") {
        fullPrompt = `
          Based on the following user input, generate a structured plan with tasks.
          User input: "${prompt}"
          
          Please return a JSON array of tasks with the following structure:
          [
            {
              "title": "Task title",
              "description": "Detailed description of the task",
              "priority": "high" | "medium" | "low",
              "estimatedTime": "Time estimate (e.g., '30 min', '2 hours')",
              "timeSlot": "Optional time slot (e.g., '9:00 AM - 10:30 AM')",
              "dueDate": "today" | "upcoming" | "completed",
              "subtasks": [
                { "title": "Subtask title", "completed": false }
              ]
            }
          ]
          
          Generate 3-5 tasks that are realistic, actionable, and relevant to the user's input.
          Make sure to include a mix of priorities and appropriate time estimates.
          For complex tasks, include subtasks to break them down.
        `;
      } else {
        fullPrompt = `
          You are a helpful productivity assistant. Respond to the following user input in a conversational, helpful manner.
          Provide specific, actionable advice when appropriate.
          
          User input: "${prompt}"
          
          Keep your response concise but informative. If the user is asking about productivity, time management, or work-related topics,
          provide evidence-based advice when possible. If the user is asking for a plan or tasks, suggest they switch to the "Task Planning" mode.
        `;
      }
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (mode === "planning") {
        // Parse tasks from the response
        const tasks = parseTasksFromResponse(text);
        
        return NextResponse.json({
          message: "Here's a structured plan based on your input. I've broken it down into manageable tasks with priorities and time estimates.",
          tasks
        });
      } else {
        // For general chat, just return the message
        return NextResponse.json({
          message: text
        });
      }
    } catch (modelError: any) {
      console.error("Error with model gemini-1.5-pro:", modelError);
      
      // Try fallback to gemini-pro
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        let fullPrompt: string;
        
        if (mode === "planning") {
          fullPrompt = `
            Based on the following user input, generate a structured plan with tasks.
            User input: "${prompt}"
            
            Please return a JSON array of tasks with the following structure:
            [
              {
                "title": "Task title",
                "description": "Detailed description of the task",
                "priority": "high" | "medium" | "low",
                "estimatedTime": "Time estimate (e.g., '30 min', '2 hours')",
                "timeSlot": "Optional time slot (e.g., '9:00 AM - 10:30 AM')",
                "dueDate": "today" | "upcoming" | "completed",
                "subtasks": [
                  { "title": "Subtask title", "completed": false }
                ]
              }
            ]
            
            Generate 3-5 tasks that are realistic, actionable, and relevant to the user's input.
            Make sure to include a mix of priorities and appropriate time estimates.
            For complex tasks, include subtasks to break them down.
          `;
        } else {
          fullPrompt = `
            You are a helpful productivity assistant. Respond to the following user input in a conversational, helpful manner.
            Provide specific, actionable advice when appropriate.
            
            User input: "${prompt}"
            
            Keep your response concise but informative. If the user is asking about productivity, time management, or work-related topics,
            provide evidence-based advice when possible. If the user is asking for a plan or tasks, suggest they switch to the "Task Planning" mode.
          `;
        }
        
        const result = await fallbackModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        if (mode === "planning") {
          // Parse tasks from the response
          const tasks = parseTasksFromResponse(text);
          
          return NextResponse.json({
            message: "Here's a structured plan based on your input. I've broken it down into manageable tasks with priorities and time estimates.",
            tasks
          });
        } else {
          // For general chat, just return the message
          return NextResponse.json({
            message: text
          });
        }
      } catch (fallbackError: any) {
        // Both models failed, return mock data
        console.error("Error with fallback model gemini-pro:", fallbackError);
        throw new Error(`Primary model error: ${modelError.message}. Fallback model error: ${fallbackError.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error generating response:", error);
    
    const { mode = "planning" } = request.json ? await request.json().catch(() => ({})) : {};
    
    // Return mock response with error message based on mode
    if (mode === "planning") {
      return NextResponse.json(
        { 
          error: "Failed to generate tasks",
          message: "I've created some sample tasks for you. For real AI-generated tasks, please check your API key or try again later.",
          mockResponse: true,
          tasks: [
            {
              id: uuidv4(),
              title: "Sample task 1",
              description: "This is a sample task created because the AI task generation failed. The error was: " + error.message,
              priority: "high",
              estimatedTime: "1 hour",
              dueDate: "today",
              completed: false,
              subtasks: [
                { title: "Check API key in settings", completed: false },
                { title: "Try again later", completed: false }
              ]
            },
            {
              id: uuidv4(),
              title: "Sample task 2",
              description: "Another sample task to help you get started.",
              priority: "medium",
              estimatedTime: "45 min",
              dueDate: "today",
              completed: false
            },
            {
              id: uuidv4(),
              title: "Sample task 3",
              description: "A third sample task with low priority.",
              priority: "low",
              estimatedTime: "30 min",
              dueDate: "upcoming",
              completed: false
            }
          ]
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          error: "Failed to generate response",
          message: "I'm sorry, I encountered an error while processing your request. Please check your API key in Settings or try again later.",
          mockResponse: true
        },
        { status: 200 }
      );
    }
  }
}