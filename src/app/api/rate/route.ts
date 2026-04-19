import { auth } from "@clerk/nextjs/server"
import { supabaseServer } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

// Groq — basic mode (free, fast, text only)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.3-70b-versatile"

const FULL_CONTEXT_COST = 3

const APP_CONTEXT: Record<string, string> = {
  Tinder:
    "Tinder is swipe-heavy and casual. Humor, boldness, and wit outperform earnestness. Openers should be punchy and low-commitment in tone.",
  Hinge:
    "Hinge is intent-driven. Users expect openers that reference their profile — a photo, a prompt answer, or a detail from their bio. Generic openers perform poorly here.",
  Bumble:
    "On Bumble, women message first for heterosexual matches. This opener is likely from a woman reaching out first, or from a same-sex match. It should feel confident but not aggressive.",
  OkCupid:
    "OkCupid users are generally more verbose and intellectually inclined. Thoughtful, slightly longer openers that reference shared interests or profile answers tend to perform well.",
  Other:
    "No specific app context provided. Rate based on general dating app best practices.",
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  const body = await req.json()

  const {
    opener,
    mode = "basic",
    app,
    screenshots,
  }: {
    opener: string
    mode: "basic" | "full"
    app?: string
    screenshots?: string[]
  } = body

  if (!opener?.trim()) {
    return NextResponse.json({ error: "Opener is required." }, { status: 400 })
  }

  // Full context requires auth + credits
  if (mode === "full") {
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to use full context." },
        { status: 401 },
      )
    }

    // Atomically check and deduct credits
    const { data: remaining } = await supabaseServer.rpc("deduct_credits", {
      user_id: userId,
      amount: FULL_CONTEXT_COST,
    })

    if (remaining === null) {
      return NextResponse.json(
        { error: "Not enough Flames. Purchase more to continue." },
        { status: 402 },
      )
    }
  }

  // Build shared system prompt
  const appContext = app && APP_CONTEXT[app] ? APP_CONTEXT[app] : null

  const systemPrompt = [
    process.env.SYSTEM_PROMPT!,
    appContext ? `\n\nAPP CONTEXT:\n${appContext}` : "",
    screenshots?.length
      ? "\n\nPROFILE CONTEXT: The user has uploaded screenshots of the person's dating profile. Analyze the photos, bio, and any visible prompts or answers. Use this context to evaluate how well-tailored this opener is for this specific person — their personality, interests, humor, and overall vibe."
      : "",
  ]
    .filter(Boolean)
    .join("")

  try {
    let result: unknown

    if (mode === "basic") {
      // ── Groq / LLaMA ──────────────────────────────────────────────
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: opener },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Groq API error")
      }

      result = JSON.parse(data.choices[0].message.content)
    } else {
      type ContentPart =
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }

      const userContent: ContentPart[] = []

      if (screenshots?.length) {
        for (const b64 of screenshots.slice(0, 3)) {
          userContent.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${b64}` },
          })
        }
      }

      userContent.push({
        type: "text",
        text: `${opener}\n\nYou MUST respond with ONLY valid JSON, no other text, no markdown, no explanation. Use this exact structure:\n{"score": 7, "verdict": "Good", "feedback": "explanation here"}`,
      })

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer":
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "https://heyhowareyou.vercel.app",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-nano-12b-v2-vl:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
          }),
        },
      )

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "OpenRouter API error")
      }

      const text = data.choices[0].message.content
      result = JSON.parse(text)
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    // Refund credits if the API call failed after deduction
    if (mode === "full" && userId) {
      await supabaseServer.rpc("increment_user_credits", {
        user_id: userId,
        amount: FULL_CONTEXT_COST,
      })
    }

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 500 },
    )
  }
}
