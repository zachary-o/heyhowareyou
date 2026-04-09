import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const PRICE_IDS: Record<string, string> = {
  top_openers: process.env.PADDLE_PRICE_TOP_OPENERS!,
  flames_10: process.env.PADDLE_PRICE_FLAMES_10!,
  flames_30: process.env.PADDLE_PRICE_FLAMES_30!,
  flames_100: process.env.PADDLE_PRICE_FLAMES_100!,
};

const isSandbox = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item = "top_openers" }: { item?: string } = await req.json();
  const priceId = PRICE_IDS[item];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const baseUrl = isSandbox
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

  const res = await fetch(`${baseUrl}/transactions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: { userId, item },
      checkout: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/explore?success=true`,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data?.error?.detail ?? "Paddle error." }, { status: 500 });
  }

  const checkoutBase = isSandbox
    ? "https://sandbox-buy.paddle.com"
    : "https://buy.paddle.com";

  return NextResponse.json({ url: `${checkoutBase}/checkout/${data.data.id}` });
}