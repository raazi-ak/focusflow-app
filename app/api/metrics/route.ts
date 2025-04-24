import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Initialize metrics registry
collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Task metrics
const taskCreationCounter = new Counter({
  name: 'tasks_created_total',
  help: 'Total number of tasks created'
});

const taskCompletionCounter = new Counter({
  name: 'tasks_completed_total',
  help: 'Total number of tasks completed'
});

const focusSessionCounter = new Counter({
  name: 'focus_sessions_total',
  help: 'Total number of focus sessions completed'
});

const focusSessionDuration = new Histogram({
  name: 'focus_session_duration_minutes',
  help: 'Duration of focus sessions in minutes',
  buckets: [5, 10, 15, 25, 30, 45, 60, 90, 120]
});

// AI metrics
const aiRequestCounter = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['type'] // 'planning', 'general', 'document'
});

const aiResponseTime = new Histogram({
  name: 'ai_response_time_seconds',
  help: 'Time taken for AI to respond',
  labelNames: ['type'], // 'planning', 'general', 'document'
  buckets: [0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30]
});

// Export functions to increment metrics from other parts of the application
export function recordHttpRequest(method: string, path: string, status: number, duration: number) {
  httpRequestCounter.inc({ method, path, status });
  httpRequestDuration.observe({ method, path, status }, duration);
}

export function recordTaskCreation() {
  taskCreationCounter.inc();
}

export function recordTaskCompletion() {
  taskCompletionCounter.inc();
}

export function recordFocusSession(durationMinutes: number) {
  focusSessionCounter.inc();
  focusSessionDuration.observe(durationMinutes);
}

export function recordAiRequest(type: 'planning' | 'general' | 'document') {
  aiRequestCounter.inc({ type });
}

export function recordAiResponse(type: 'planning' | 'general' | 'document', durationSeconds: number) {
  aiResponseTime.observe({ type }, durationSeconds);
}

// Metrics endpoint
export async function GET() {
  try {
    // Generate metrics
    const metrics = await register.metrics();
    
    // Return metrics in Prometheus format
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType
      }
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}