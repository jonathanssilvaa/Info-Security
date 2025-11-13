"use client"

import { useRef, useEffect } from "react"

export function useRenderCount(componentName: string) {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())

  useEffect(() => {
    renderCount.current++

    if (renderCount.current > 50) {
      console.warn(`[v0] ${componentName} has rendered ${renderCount.current} times. Possible infinite loop detected!`)
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[v0] ${componentName} render count:`, renderCount.current)
    }
  })

  return {
    count: renderCount.current,
    timeSinceMountMs: Date.now() - mountTime.current,
  }
}
