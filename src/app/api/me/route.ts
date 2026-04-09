import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await supabaseServer
    .from("users")
    .select("is_premium")
    .eq("id", userId)
    .single();

  return NextResponse.json({ isPremium: user?.is_premium ?? false });
}