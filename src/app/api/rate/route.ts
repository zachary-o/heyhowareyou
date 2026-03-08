import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { opener } = await req.json();

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: process.env.SYSTEM_PROMPT!,
          },
          {
            role: "user",
            content: opener,
          },
        ],
        response_format: { type: "json_object" },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    return NextResponse.json(
      { error: data.error?.message || "API error" },
      { status: 500 },
    );
  }

  const result = JSON.parse(data.choices[0].message.content);
  return NextResponse.json(result);
}
