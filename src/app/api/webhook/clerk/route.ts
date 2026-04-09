import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const INITIAL_CREDITS = 3;

async function verifyClerkSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  // Build signed content: id.timestamp.body
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

  // Secret is base64 encoded after the "whsec_" prefix
  const base64Secret = secret.replace("whsec_", "");
  const keyBytes = Uint8Array.from(atob(base64Secret), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );

  const computedSignature =
    "v1," + btoa(String.fromCharCode(...new Uint8Array(mac)));

  // svix-signature can contain multiple signatures separated by spaces
  const signatures = svixSignature.split(" ");
  return signatures.some((sig) => sig === computedSignature);
}

export async function POST(req: NextRequest) {
  const svixId = req.headers.get("svix-id")!;
  const svixTimestamp = req.headers.get("svix-timestamp")!;
  const svixSignature = req.headers.get("svix-signature")!;
  const rawBody = await req.text();

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const isValid = await verifyClerkSignature(
    rawBody,
    svixId,
    svixTimestamp,
    svixSignature,
    process.env.CLERK_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data: { id: string };
  };

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