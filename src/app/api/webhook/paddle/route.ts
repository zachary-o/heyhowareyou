import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const FLAMES_BY_ITEM: Record<string, number> = {
  flames_10: 10,
  flames_30: 30,
  flames_100: 100,
};

async function verifyPaddleSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Parse ts and h1 from the signature header
  const parts = Object.fromEntries(
    signature.split(";").map((part) => part.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Build signed payload
  const signedPayload = `${ts}:${rawBody}`;

  // Import secret key using Web Crypto API
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Compute HMAC
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );

  // Convert to hex
  const computedHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHex === h1;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const isValid = await verifyPaddleSignature(
    rawBody,
    signature,
    process.env.PADDLE_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event_type === "transaction.completed") {
    const customData = event.data?.custom_data as {
      userId?: string;
      item?: string;
    } | null;

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
        await supabaseServer.rpc("increment_user_credits", {
          user_id: userId,
          amount: flamesToAdd,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}