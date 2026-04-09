import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const IMPROVE_COST = 2;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to use this feature." },
      { status: 401 }
    );
  }

  const { opener, feedback }: { opener: string; feedback: string } =
    await req.json();

  if (!opener?.trim() || !feedback?.trim()) {
    return NextResponse.json(
      { error: "Opener and feedback are required." },
      { status: 400 }
    );
  }

  // Atomically check and deduct credits
  const { data: remaining } = await supabaseServer.rpc("deduct_credits", {
    user_id: userId,
    amount: IMPROVE_COST,
  });

  if (remaining === null) {
    return NextResponse.json(
      { error: "Not enough Flames. Purchase more to continue." },
      { status: 402 }
    );
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: process.env.IMPROVE_PROMPT! },
          {
            role: "user",
            content: `Original opener: "${opener}"\n\nFeedback: "${feedback}"`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Groq API error");
    }

    const result = JSON.parse(data.choices[0].message.content);

    if (!result.improved) {
      throw new Error("Invalid response format from model");
    }

    return NextResponse.json({ improved: result.improved });
  } catch (e: unknown) {
    // Refund credits on failure
    await supabaseServer.rpc("increment_user_credits", {
      user_id: userId,
      amount: IMPROVE_COST,
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 500 }
    );
  }
}