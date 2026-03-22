import { NextRequest, NextResponse } from "next/server";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { supabaseServer } from "@/lib/supabase-server";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NODE_ENV === "development"
      ? Environment.sandbox
      : Environment.production,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature")!;
  const rawBody = await req.text();

  let event;

  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.eventType === EventName.TransactionCompleted) {
    const userId = (event.data as { customData?: { userId?: string } })
      .customData?.userId;

    if (userId) {
      await supabaseServer
        .from("users")
        .upsert({ id: userId, is_premium: true }, { onConflict: "id" });
    }
  }

  return NextResponse.json({ received: true });
}
