"use client"

import { useRef, useCallback } from "react"

/**
 * Hook para contar e monitorar chamadas de funções
 * Útil para detectar renderizações excessivas
 */
interface CallCounterOptions {
  maxCalls?: number
  timeWindow?: number // em ms
  onThreshold?: (count: number, limit: number) => void
  name?: string
}

export function useCallCounter(options: CallCounterOptions = {}) {
  const { maxCalls = 50, timeWindow = 1000, onThreshold, name = "unknown" } = options

  const callTimestampsRef = useRef<number[]>([])
  const countRef = useRef(0)

  const track = useCallback(() => {
    const now = performance.now()
    countRef.current++

    // Remover timestamps fora da janela de tempo
    callTimestampsRef.current = callTimestampsRef.current.filter((ts) => now - ts < timeWindow)

    // Adicionar novo timestamp
    callTimestampsRef.current.push(now)

    const callCount = callTimestampsRef.current.length

    if (callCount >= maxCalls) {
      const message = `[v0] ⚠️  Limite de chamadas excedido em "${name}": ${callCount}/${maxCalls} em ${timeWindow}ms`
      console.warn(message)

      if (onThreshold) {
        onThreshold(callCount, maxCalls)
      }
    }

    return callCount
  }, [maxCalls, timeWindow, onThreshold, name])

  const reset = useCallback(() => {
    callTimestampsRef.current = []
    countRef.current = 0
  }, [])

  const getCount = useCallback(() => callTimestampsRef.current.length, [])

  return { track, reset, getCount }
}
