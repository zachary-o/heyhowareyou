import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

const INITIAL_CREDITS = 3;

export async function POST(req: NextRequest) {
  const signature = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const rawBody = await req.text();

  let event;

  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    event = wh.verify(rawBody, signature) as { type: string; data: { id: string } };
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const userId = event.data.id;

    await supabaseServer
      .from("users")
      .upsert(
        { id: userId, credits: INITIAL_CREDITS, is_premium: false },
        { onConflict: "id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ received: true });
}