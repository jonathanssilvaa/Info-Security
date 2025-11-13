"use client"

import { useEffect, useRef } from "react"

interface UpdateMetrics {
  renderCount: number
  lastRenderTime: number
  renderTimes: number[]
  isExcessiveUpdates: boolean
}

/**
 * Hook to detect excessive update cycles and prevent infinite loops
 * Monitors render frequency and logs warnings when patterns suggest infinite loops
 */
export function useUpdateDepthMonitor(componentName: string, threshold = 10) {
  const metricsRef = useRef<UpdateMetrics>({
    renderCount: 0,
    lastRenderTime: Date.now(),
    renderTimes: [],
    isExcessiveUpdates: false,
  })

  useEffect(() => {
    const metrics = metricsRef.current
    const now = Date.now()
    const timeSinceLastRender = now - metrics.lastRenderTime

    metrics.renderCount++
    metrics.lastRenderTime = now
    metrics.renderTimes.push(timeSinceLastRender)

    // Keep only last 20 renders
    if (metrics.renderTimes.length > 20) {
      metrics.renderTimes.shift()
    }

    // Check if we have excessive rapid renders (< 16ms apart = > 60fps on every update)
    const recentRapidRenders = metrics.renderTimes.filter((time) => time < 16).length
    if (recentRapidRenders > threshold) {
      metrics.isExcessiveUpdates = true
      console.warn(`[v0] Excessive updates detected in ${componentName}:`, {
        renderCount: metrics.renderCount,
        rapidRenders: recentRapidRenders,
        averageTime: (metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length).toFixed(2),
      })
    } else {
      metrics.isExcessiveUpdates = false
    }

    // Reset counter every 5 seconds
    const timer = setTimeout(() => {
      metrics.renderCount = 0
      metrics.renderTimes = []
    }, 5000)

    return () => clearTimeout(timer)
  })

  return metricsRef.current
}
