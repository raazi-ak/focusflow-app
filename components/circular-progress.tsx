"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  showText?: boolean
  textFormatter?: (value: number, max: number) => string
  className?: string
  color?: string
  animate?: boolean
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  showText = true,
  textFormatter = (value, max) => `${Math.round((value / max) * 100)}%`,
  className,
  color,
  animate = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(value, 0), max) / max
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className={cn("circular-progress", className)} style={{ width: size, height: size }}>
      <svg
        className="circular-progress-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="circular-progress-circle circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {animate ? (
          <motion.circle
            className="circular-progress-circle circular-progress-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            style={{ 
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
              stroke: color ? `var(--${color})` : 'var(--accent-color)'
            }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        ) : (
          <circle
            className="circular-progress-circle circular-progress-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            style={{ 
              strokeDasharray: circumference,
              strokeDashoffset,
              stroke: color ? `var(--${color})` : 'var(--accent-color)'
            }}
          />
        )}
      </svg>
      {showText && (
        <div className="circular-progress-text">
          {textFormatter(value, max)}
        </div>
      )}
    </div>
  )
}