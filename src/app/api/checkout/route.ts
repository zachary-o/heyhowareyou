import { NextResponse } from "next/server";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { auth } from "@clerk/nextjs/server";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NODE_ENV === "development"
      ? Environment.sandbox
      : Environment.production,
});

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transaction = await paddle.transactions.create({
    items: [
      {
        priceId: process.env.PADDLE_PRICE_ID!,
        quantity: 1,
      },
    ],
    customData: { userId },
    checkout: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/explore?success=true`,
    },
  });

  return NextResponse.json({
    url:
      process.env.NODE_ENV === "development"
        ? `https://sandbox-buy.paddle.com/checkout/${transaction.id}`
        : `https://buy.paddle.com/checkout/${transaction.id}`,
  });
}
