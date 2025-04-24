import { NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Get file extension
    const fileType = file.name.split(".").pop()?.toLowerCase()
    
    // Process based on file type
    let text = ""
    
    if (fileType === "pdf") {
      // For PDFs, we'll use a simpler approach in the Node.js environment
      // This is a fallback message until we implement a proper PDF parser
      text = "PDF parsing is currently limited in the server environment. For best results, please extract the text from the PDF and paste it directly, or upload an image of the content."
    } else if (["jpg", "jpeg", "png", "bmp", "gif", "webp"].includes(fileType || "")) {
      text = await extractTextFromImage(file)
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or image file." },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process file" },
      { status: 500 }
    )
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create worker with English language
    const worker = await createWorker('eng')
    
    // Recognize text
    const { data } = await worker.recognize(buffer)
    await worker.terminate()
    
    return data.text
  } catch (error) {
    console.error("Error extracting text from image:", error)
    return "Error extracting text from image. Please try again with a clearer image."
  }
}

// Increase payload size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
}