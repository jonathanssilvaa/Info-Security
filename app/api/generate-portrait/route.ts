import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt, formData } = await request.json()

    console.log("[v0] Generating portrait with prompt:", prompt)

    // Check if Hugging Face API key is available
    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      console.warn("[v0] No Hugging Face API key found, using placeholder")
      return generatePlaceholderResponse(formData, prompt)
    }

    // Build optimized prompt for face generation
    const optimizedPrompt = buildOptimizedPrompt(formData)
    console.log("[v0] Optimized prompt:", optimizedPrompt)

    // Call Hugging Face Inference API with retry logic and fallback models
    const imageUrl = await generateWithHuggingFaceWithFallback(optimizedPrompt, apiKey)

    return NextResponse.json({
      imageUrl: imageUrl,
      prompt: optimizedPrompt,
      success: true,
      metadata: {
        generatedAt: new Date().toISOString(),
        characteristics: formData,
        provider: "huggingface",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error generating portrait:", error.message)
    console.error("[v0] Error stack:", error.stack)

    // Handle specific error types
    if (error.message?.includes("rate limit")) {
      console.error("[v0] Rate limit exceeded")
      return NextResponse.json(
        {
          error: "Limite de uso atingido. Por favor, tente novamente em alguns minutos.",
          success: false,
          retryAfter: 60,
        },
        { status: 429 },
      )
    }

    if (error.message?.includes("API key") || error.message?.includes("401") || error.message?.includes("403")) {
      console.error("[v0] Authentication error")
      return NextResponse.json(
        {
          error: "Erro de autenticação. Por favor, verifique a configuração da API.",
          success: false,
        },
        { status: 401 },
      )
    }

    console.log("[v0] Using placeholder fallback due to error:", error.message)
    return generatePlaceholderResponse({}, "")
  }
}

async function generateWithHuggingFaceWithFallback(prompt: string, apiKey: string): Promise<string> {
  // List of models to try in order of preference
  const models = [
    "runwayml/stable-diffusion-v1-5", // Most reliable, well-maintained model
    "stabilityai/stable-diffusion-2", // Older but more stable than 3.5
    "prompthero/openjourney-v4", // Alternative style model
  ]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      console.log(`[v0] Attempting to generate with model: ${model}`)
      const result = await generateWithHuggingFaceWithRetry(prompt, apiKey, model, 2)
      console.log(`[v0] Successfully generated portrait with model: ${model}`)
      return result
    } catch (error: any) {
      lastError = error
      console.warn(`[v0] Model ${model} failed:`, error.message)

      // Don't try other models for auth errors
      if (error.message?.includes("401") || error.message?.includes("403")) {
        throw error
      }

      // Continue to next model for other errors
      continue
    }
  }

  throw lastError || new Error("Failed to generate portrait with all available models")
}

async function generateWithHuggingFaceWithRetry(
  prompt: string,
  apiKey: string,
  model: string,
  maxRetries = 2,
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Attempt ${attempt}/${maxRetries} to generate portrait with ${model}`)
      const result = await generateWithHuggingFace(prompt, apiKey, model)
      return result
    } catch (error: any) {
      lastError = error
      console.error(`[v0] Attempt ${attempt} failed:`, error.message)

      // Don't retry on auth errors or not found errors
      if (error.message?.includes("401") || error.message?.includes("403") || error.message?.includes("404")) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`[v0] Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error(`Failed to generate portrait with ${model} after multiple attempts`)
}

async function generateWithHuggingFace(prompt: string, apiKey: string, model: string): Promise<string> {
  const apiUrl = `https://api-inference.huggingface.co/models/${model}`

  console.log("[v0] Calling Hugging Face API:", apiUrl)
  console.log("[v0] Model:", model)

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt:
            "blurry, low quality, distorted, deformed, cartoon, anime, illustration, painting, drawing, sketch, multiple faces, duplicate, cropped",
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }),
    })

    console.log("[v0] API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error response:", errorText)

      if (response.status === 429) {
        throw new Error("rate limit exceeded - API quota reached. Try again later.")
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("API key invalid or unauthorized (401/403) - Check HUGGINGFACE_API_KEY")
      }
      if (response.status === 404) {
        throw new Error(`Model endpoint not found (404) - Model may be unavailable: ${model}`)
      }
      if (response.status === 400) {
        throw new Error(`Model service error (400) - Model endpoint is in error state, will try alternative`)
      }
      if (response.status === 500 || response.status === 503) {
        throw new Error(
          `Hugging Face service error (${response.status}) - Service temporarily unavailable, please try again later`,
        )
      }

      throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`)
    }

    // Convert response to base64 data URL
    const imageBuffer = await response.arrayBuffer()
    console.log("[v0] Image buffer size:", imageBuffer.byteLength)

    if (imageBuffer.byteLength === 0) {
      throw new Error("API returned empty image buffer")
    }

    const base64Image = Buffer.from(imageBuffer).toString("base64")
    const dataUrl = `data:image/png;base64,${base64Image}`

    console.log("[v0] Portrait generated successfully, base64 length:", base64Image.length)
    return dataUrl
  } catch (error: any) {
    console.error("[v0] Fetch error:", error.message)
    throw error
  }
}

function buildOptimizedPrompt(formData: any): string {
  const parts: string[] = []

  // Start with base prompt for realistic portrait
  parts.push("professional police sketch")
  parts.push("realistic human face portrait")
  parts.push("front facing view")
  parts.push("neutral expression")
  parts.push("high detail")
  parts.push("photorealistic")

  // Add sex and age
  if (formData.sex) {
    parts.push(formData.sex === "masculino" ? "male person" : "female person")
  }
  if (formData.age) {
    parts.push(`approximately ${formData.age} years old`)
  }

  // Add skin tone
  if (formData.skinTone) {
    const skinToneMap: Record<string, string> = {
      "muito clara": "very fair skin",
      clara: "fair skin",
      média: "medium skin tone",
      morena: "tan skin",
      escura: "dark skin",
      "muito escura": "very dark skin",
    }
    parts.push(skinToneMap[formData.skinTone] || formData.skinTone)
  }

  // Add face shape
  if (formData.faceShape) {
    const faceShapeMap: Record<string, string> = {
      oval: "oval face shape",
      redondo: "round face",
      quadrado: "square jaw",
      triangular: "triangular face",
      alongado: "elongated face",
      coração: "heart-shaped face",
    }
    parts.push(faceShapeMap[formData.faceShape] || formData.faceShape)
  }

  // Hair details
  if (formData.hairColor && formData.hairLength) {
    const hairLengthMap: Record<string, string> = {
      careca: "bald",
      "muito curto": "very short",
      curto: "short",
      médio: "medium length",
      longo: "long",
      "muito longo": "very long",
    }
    const hairColorMap: Record<string, string> = {
      preto: "black",
      "castanho escuro": "dark brown",
      castanho: "brown",
      "castanho claro": "light brown",
      loiro: "blonde",
      ruivo: "red",
      grisalho: "gray",
      branco: "white",
      colorido: "dyed",
    }

    const length = hairLengthMap[formData.hairLength] || formData.hairLength
    const color = hairColorMap[formData.hairColor] || formData.hairColor

    if (length !== "bald") {
      parts.push(`${length} ${color} hair`)
    } else {
      parts.push("bald head")
    }
  }

  if (formData.hairStyle) {
    parts.push(formData.hairStyle)
  }

  // Eyes
  if (formData.eyeColor) {
    const eyeColorMap: Record<string, string> = {
      "castanhos escuros": "dark brown eyes",
      castanhos: "brown eyes",
      "castanhos claros": "light brown eyes",
      verdes: "green eyes",
      azuis: "blue eyes",
      cinzas: "gray eyes",
      mel: "hazel eyes",
    }
    parts.push(eyeColorMap[formData.eyeColor] || formData.eyeColor)
  }

  if (formData.eyeShape) {
    const eyeShapeMap: Record<string, string> = {
      amendoados: "almond-shaped eyes",
      redondos: "round eyes",
      puxados: "upturned eyes",
      caídos: "downturned eyes",
      encapuzados: "hooded eyes",
    }
    parts.push(eyeShapeMap[formData.eyeShape] || formData.eyeShape)
  }

  // Nose
  if (formData.noseShape) {
    const noseMap: Record<string, string> = {
      fino: "thin nose",
      médio: "medium nose",
      largo: "wide nose",
      aquilino: "aquiline nose",
      arrebitado: "upturned nose",
      achatado: "flat nose",
    }
    parts.push(noseMap[formData.noseShape] || formData.noseShape)
  }

  // Mouth
  if (formData.mouthShape) {
    parts.push(formData.mouthShape)
  }

  // Facial hair (for males)
  if (formData.facialHair && formData.sex === "masculino" && formData.facialHair !== "sem barba") {
    const facialHairMap: Record<string, string> = {
      "barba por fazer": "stubble",
      "barba curta": "short beard",
      "barba média": "medium beard",
      "barba longa": "long beard",
      cavanhaque: "goatee",
      bigode: "mustache",
      "barba e bigode": "full beard and mustache",
    }
    parts.push(facialHairMap[formData.facialHair] || formData.facialHair)
  }

  // Distinctive features
  if (formData.distinctiveFeatures) {
    parts.push(formData.distinctiveFeatures)
  }

  // Add quality enhancers
  parts.push("clear facial features")
  parts.push("professional photography")
  parts.push("studio lighting")
  parts.push("sharp focus")

  return parts.join(", ")
}

function generatePlaceholderResponse(formData: any, prompt: string) {
  const portraitQuery = buildPortraitQuery(formData)
  const imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(portraitQuery)}`

  return NextResponse.json({
    imageUrl: imageUrl,
    prompt: prompt,
    success: true,
    metadata: {
      generatedAt: new Date().toISOString(),
      characteristics: formData,
      provider: "placeholder",
      note: "Using placeholder. Add HUGGINGFACE_API_KEY to environment variables for AI generation.",
    },
  })
}

function buildPortraitQuery(formData: any): string {
  const parts: string[] = ["professional police sketch portrait"]

  if (formData.sex) {
    parts.push(formData.sex === "masculino" ? "male face" : "female face")
  }
  if (formData.age) {
    parts.push(`age ${formData.age}`)
  }
  if (formData.skinTone) parts.push(`${formData.skinTone} skin`)
  if (formData.faceShape) parts.push(`${formData.faceShape} face shape`)

  if (formData.hairColor && formData.hairLength) {
    parts.push(`${formData.hairLength} ${formData.hairColor} hair`)
  }
  if (formData.hairStyle) parts.push(formData.hairStyle)

  if (formData.eyeColor) parts.push(`${formData.eyeColor} eyes`)
  if (formData.eyeShape) parts.push(`${formData.eyeShape} shaped eyes`)

  if (formData.noseShape) parts.push(`${formData.noseShape} nose`)
  if (formData.facialHair && formData.sex === "masculino") parts.push(formData.facialHair)

  parts.push("front facing")
  parts.push("neutral expression")
  parts.push("realistic detailed portrait")

  return parts.join(", ")
}
