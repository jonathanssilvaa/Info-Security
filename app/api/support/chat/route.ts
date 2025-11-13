import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Create or get session
    const session = sessionId || `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log("[v0] Chat message received:", { session, message })

    // Simulate AI/support agent response
    const responses = [
      "Obrigado por entrar em contato. Como posso ajudá-lo hoje?",
      "Entendo sua preocupação. Deixe-me verificar isso para você.",
      "Posso ajudá-lo com isso. Você pode fornecer mais detalhes?",
      "Vou encaminhar sua solicitação para nossa equipe especializada.",
      "Isso foi resolvido? Há algo mais em que eu possa ajudar?",
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Simulate delay for realistic chat experience
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      sessionId: session,
      response: {
        id: `MSG-${Date.now()}`,
        message: randomResponse,
        sender: "support",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error processing chat message:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
