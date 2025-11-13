"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] Error caught by boundary:", error.message)
    return {
      hasError: true,
      error,
      errorCount: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] Error details:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
    })
  }

  render() {
    if (this.state.hasError) {
      const isMaxUpdateDepth = this.state.error?.message.includes("Maximum update depth")

      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950 p-4">
          <Card className="w-full max-w-md p-6 border-red-200 dark:border-red-800">
            <div className="flex gap-4 items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                  {isMaxUpdateDepth ? "Erro de Atualização" : "Algo deu errado"}
                </h2>
                <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                  {isMaxUpdateDepth
                    ? "A aplicação entrou em um loop infinito. Tente recarregar a página."
                    : "Um erro inesperado ocorreu. Tente recarregar a página."}
                </p>
                {process.env.NODE_ENV === "development" && (
                  <details className="text-xs text-red-700 dark:text-red-400 mb-4">
                    <summary className="cursor-pointer font-mono">Detalhes do erro</summary>
                    <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded overflow-auto text-xs">
                      {this.state.error?.message}
                    </pre>
                  </details>
                )}
                <button
                  onClick={() => {
                    this.resetError()
                    window.location.reload()
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
