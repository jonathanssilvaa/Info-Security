import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create ticket object
    const ticket = {
      id: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      subject,
      message,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("[v0] Support ticket created:", ticket)

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to support team
    // 3. Send confirmation email to user
    // 4. Create ticket in support system (Zendesk, Freshdesk, etc.)

    // For now, we'll simulate success
    return NextResponse.json({
      success: true,
      ticket,
      message: "Support ticket created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating support ticket:", error)
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // In a real application, fetch tickets from database
    // For now, return mock data
    const tickets = [
      {
        id: "TICKET-001",
        subject: "Problema com mapa",
        status: "resolved",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "TICKET-002",
        subject: "Dúvida sobre boletim",
        status: "open",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("[v0] Error fetching support tickets:", error)
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
  }
}
