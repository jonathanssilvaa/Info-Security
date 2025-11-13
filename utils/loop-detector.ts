"use client"

/**
 * Loop Detector - Sistema para rastrear e detectar loops infinitos
 * Fornece métricas detalhadas sobre fluxo de execução e chamadas repetidas
 */

interface ExecutionEntry {
  timestamp: number
  context: string
  callStack: string[]
  delta: number
}

interface LoopMetrics {
  context: string
  totalCalls: number
  callsInLastSecond: number
  callsInLastMs: number
  isLooping: boolean
  severity: "low" | "medium" | "high" | "critical"
  lastExecution: number
  executionRate: number // calls per second
}

class LoopDetector {
  private executions = new Map<string, ExecutionEntry[]>()
  private readonly MAX_HISTORY = 100
  private readonly WARNING_THRESHOLD = 10 // calls per 100ms
  private readonly CRITICAL_THRESHOLD = 50 // calls per 100ms

  /**
   * Registra uma execução para rastreamento
   */
  track(context: string, metadata?: Record<string, any>) {
    const timestamp = performance.now()
    const callStack = this.getCallStack()

    if (!this.executions.has(context)) {
      this.executions.set(context, [])
    }

    const entries = this.executions.get(context)!
    const lastEntry = entries[entries.length - 1]
    const delta = lastEntry ? timestamp - lastEntry.timestamp : 0

    entries.push({ timestamp, context, callStack, delta })

    // Manter histórico limitado
    if (entries.length > this.MAX_HISTORY) {
      entries.shift()
    }

    const metrics = this.getMetrics(context)

    // Log de avisos
    if (metrics.severity === "high") {
      console.warn(`[v0] ⚠️  Loop detectado em "${context}": ${metrics.callsInLastMs} chamadas em 100ms`)
    } else if (metrics.severity === "critical") {
      console.error(`[v0] 🔴 LOOP CRÍTICO em "${context}": ${metrics.callsInLastMs} chamadas em 100ms`)
    }

    return metrics
  }

  /**
   * Obtém métricas de execução para um contexto
   */
  getMetrics(context: string): LoopMetrics {
    const entries = this.executions.get(context) || []
    if (entries.length === 0) {
      return {
        context,
        totalCalls: 0,
        callsInLastSecond: 0,
        callsInLastMs: 0,
        isLooping: false,
        severity: "low",
        lastExecution: 0,
        executionRate: 0,
      }
    }

    const now = performance.now()
    const lastMs = entries.filter((e) => now - e.timestamp < 100).length
    const lastSecond = entries.filter((e) => now - e.timestamp < 1000).length
    const executionRate = lastSecond

    const severity = lastMs >= this.CRITICAL_THRESHOLD ? "critical" : lastMs >= this.WARNING_THRESHOLD ? "high" : "low"

    return {
      context,
      totalCalls: entries.length,
      callsInLastSecond: lastSecond,
      callsInLastMs: lastMs,
      isLooping: lastMs >= this.WARNING_THRESHOLD,
      severity,
      lastExecution: entries[entries.length - 1].timestamp,
      executionRate,
    }
  }

  /**
   * Obtém relatório de todos os contextos monitorados
   */
  getReport(): LoopMetrics[] {
    return Array.from(this.executions.keys()).map((context) => this.getMetrics(context))
  }

  /**
   * Limpa histórico de um contexto
   */
  reset(context?: string) {
    if (context) {
      this.executions.delete(context)
    } else {
      this.executions.clear()
    }
  }

  /**
   * Extrai call stack simplificado (apenas nomes de funções)
   */
  private getCallStack(): string[] {
    const stack = new Error().stack || ""
    return stack
      .split("\n")
      .slice(2, 6)
      .map((line) => {
        const match = line.match(/at\s+(.+?)\s+\(/)
        return match ? match[1] : line.trim()
      })
      .filter(Boolean)
  }
}

export const loopDetector = new LoopDetector()

/**
 * Hook para rastreamento de loops em useEffect
 */
export function useLoopDetection(context: string, enabled = process.env.NODE_ENV === "development") {
  if (!enabled) return

  return () => {
    const metrics = loopDetector.track(context)
    if (metrics.severity === "high" || metrics.severity === "critical") {
      console.group(`[v0] Loop Detection Report: ${context}`)
      console.table(metrics)
      console.groupEnd()
    }
  }
}
