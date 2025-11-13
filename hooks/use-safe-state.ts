"use client"

import { useCallback, useRef, useState, useEffect } from "react"

interface SafeStateOptions {
  onUpdate?: (newValue: any, oldValue: any) => void
  maxUpdatesPerSecond?: number
  debugName?: string
}

/**
 * Safe state hook that prevents rapid consecutive updates
 * Implements debouncing and update throttling to avoid infinite loops
 */
export function useSafeState<T>(
  initialValue: T,
  options: SafeStateOptions = {},
): [T, (value: T | ((prev: T) => T)) => void, { isThrottled: boolean }] {
  const { onUpdate, maxUpdatesPerSecond = 10, debugName = "state" } = options
  const [state, setState] = useState<T>(initialValue)
  const lastUpdateRef = useRef<number>(Date.now())
  const updateCountRef = useRef<number>(0)
  const isThrottledRef = useRef<boolean>(false)
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const setSafeState = useCallback(
    (value: T | ((prev: T) => T)) => {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastUpdateRef.current
      const minTimeBetweenUpdates = 1000 / maxUpdatesPerSecond

      if (timeSinceLastUpdate < minTimeBetweenUpdates) {
        isThrottledRef.current = true
        console.warn(`[v0] Update throttled for ${debugName}: too many updates (${updateCountRef.current}/sec)`)

        // Clear existing throttle timer
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current)
        }

        // Schedule update for after throttle period
        throttleTimerRef.current = setTimeout(() => {
          setState(value)
          lastUpdateRef.current = Date.now()
          updateCountRef.current = 0
          isThrottledRef.current = false
          onUpdate?.(typeof value === "function" ? value(state) : value, state)
        }, minTimeBetweenUpdates - timeSinceLastUpdate)

        return
      }

      lastUpdateRef.current = now
      updateCountRef.current++

      const newState = typeof value === "function" ? value(state) : value
      if (newState !== state) {
        setState(newState)
        onUpdate?.(newState, state)
      }
    },
    [state, onUpdate, maxUpdatesPerSecond, debugName],
  )

  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current)
      }
    }
  }, [])

  return [state, setSafeState, { isThrottled: isThrottledRef.current }]
}
