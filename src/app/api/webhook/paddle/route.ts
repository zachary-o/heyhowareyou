import { supabaseServer } from "@/lib/supabase-server";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NODE_ENV === "development"
      ? Environment.sandbox
      : Environment.production,
});

const FLAMES_BY_ITEM: Record<string, number> = {
  flames_10: 10,
  flames_30: 30,
  flames_100: 100,
};

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
    const customData = (event.data as { customData?: { userId?: string; item?: string } })
      .customData;

    const userId = customData?.userId;
    const item = customData?.item ?? "top_openers";

    if (!userId) {
      return NextResponse.json({ received: true });
    }

    if (item === "top_openers") {
      await supabaseServer
        .from("users")
        .upsert({ id: userId, is_premium: true }, { onConflict: "id" });
    } else {
      const flamesToAdd = FLAMES_BY_ITEM[item];
      if (flamesToAdd) {
        const { data: user } = await supabaseServer
          .from("users")
          .select("credits")
          .eq("id", userId)
          .single();

        const currentCredits = user?.credits ?? 0;

        await supabaseServer
          .from("users")
          .upsert(
            { id: userId, credits: currentCredits + flamesToAdd },
            { onConflict: "id" }
          );
      }
    }
  }

  return NextResponse.json({ received: true });
}