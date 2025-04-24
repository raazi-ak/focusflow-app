"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Image, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { CircularProgress } from "@/components/circular-progress"

interface FileUploadProps {
  onTextExtracted: (text: string) => void
  accentColor?: string
}

export function FileUpload({ onTextExtracted, accentColor = "primary" }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Simulate loading progress
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 10
          return next > 100 ? 100 : next
        })
      }, 300)
    } else {
      setLoadingProgress(0)
    }
    
    return () => clearInterval(interval)
  }, [isLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    // Check file type
    const fileType = selectedFile.type
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      'application/pdf'
    ]
    
    if (!validTypes.includes(fileType)) {
      toast.error("Please upload a PDF or image file (JPEG, PNG, GIF, BMP, WEBP)")
      return
    }
    
    // Check file size (limit to 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit")
      return
    }
    
    setFile(selectedFile)
    setExtractedText(null)
    
    // Create preview for images
    if (fileType.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      // For PDFs, use a generic icon
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setIsLoading(true)
    setLoadingProgress(0)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process file")
      }
      
      const data = await response.json()
      setExtractedText(data.text)
      onTextExtracted(data.text)
      toast.success("Text extracted successfully")
    } catch (error: any) {
      console.error("Error processing file:", error)
      toast.error(error.message || "Failed to process file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setExtractedText(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Upload className="h-4 w-4" />
          Select File
        </Button>
        
        {file && (
          <Button 
            onClick={handleClear}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {preview ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded border">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded border bg-muted">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {file.type}
                    </p>
                  </div>
                  
                  {!isLoading && !extractedText && (
                    <Button 
                      onClick={handleUpload}
                      className={`bg-${accentColor} hover:bg-${accentColor}/90`}
                    >
                      Extract Text
                    </Button>
                  )}
                  
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8">
                        <CircularProgress 
                          value={loadingProgress} 
                          max={100} 
                          size={32} 
                          strokeWidth={4} 
                          showText={false}
                          color={accentColor}
                          animate={true}
                        />
                      </div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {extractedText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium">Extracted Text:</p>
                <Card>
                  <CardContent className="p-4 max-h-[200px] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">{extractedText}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {!file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-2 border-dashed rounded-lg p-8 text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`h-12 w-12 rounded-full bg-${accentColor}/10 flex items-center justify-center`}>
                <Image className={`h-6 w-6 text-${accentColor}`} />
              </div>
              <p className="font-medium">Upload an image or PDF</p>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPEG, PNG, GIF, BMP, WEBP, PDF
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}