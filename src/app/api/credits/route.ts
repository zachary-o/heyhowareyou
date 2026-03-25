import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error } = await supabaseServer
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ credits: 0 });
  }

  return NextResponse.json({ credits: user.credits });
}