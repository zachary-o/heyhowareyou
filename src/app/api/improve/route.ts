import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  // Check + deduct credits
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (userError || !user || user.credits < IMPROVE_COST) {
    return NextResponse.json(
      { error: "Not enough Flames. Purchase more to continue." },
      { status: 402 }
    );
  }

  const { error: deductError } = await supabase
    .from("users")
    .update({ credits: user.credits - IMPROVE_COST })
    .eq("id", userId);

  if (deductError) {
    return NextResponse.json(
      { error: "Failed to deduct credits." },
      { status: 500 }
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
          { role: "system", content: process.env.SYSTEM_PROMPT! },
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
    const { data: currentUser } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (currentUser) {
      await supabase
        .from("users")
        .update({ credits: currentUser.credits + IMPROVE_COST })
        .eq("id", userId);
    }

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 500 }
    );
  }
}