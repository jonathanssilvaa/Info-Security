"use client"

import { useRef, useCallback } from "react"

/**
 * Hook para rastrear execução de efeitos
 * Detecta efeitos que executam muito frequentemente
 */
interface EffectTrackerOptions {
  name: string
  maxExecutions?: number
  timeWindow?: number // em ms
  throwOnExcess?: boolean
}

export function useEffectTracker(options: EffectTrackerOptions) {
  const { name, maxExecutions = 100, timeWindow = 5000, throwOnExcess = false } = options

  const executionsRef = useRef<Array<{ timestamp: number; duration?: number }>>([])

  const recordExecution = useCallback(
    (duration?: number) => {
      const now = performance.now()

      // Remover execuções fora da janela
      executionsRef.current = executionsRef.current.filter((e) => now - e.timestamp < timeWindow)

      executionsRef.current.push({ timestamp: now, duration })

      const count = executionsRef.current.length

      if (count >= maxExecutions) {
        const message = `[v0] 🔴 EXCESSO DE EXECUÇÕES em "${name}": ${count} vezes em ${timeWindow}ms`
        console.error(message)

        if (throwOnExcess) {
          throw new Error(`Effect execution limit exceeded: ${name}`)
        }
      }

      return count
    },
    [name, maxExecutions, timeWindow, throwOnExcess],
  )

  const getReport = useCallback(() => {
    return {
      name,
      executions: executionsRef.current.length,
      avgDuration:
        executionsRef.current.length > 0
          ? executionsRef.current.reduce((sum, e) => sum + (e.duration || 0), 0) / executionsRef.current.length
          : 0,
      lastExecution: executionsRef.current[executionsRef.current.length - 1]?.timestamp || 0,
    }
  }, [name])

  return { recordExecution, getReport }
}
