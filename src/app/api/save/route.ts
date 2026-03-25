import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opener, score, feedback } = await req.json();

  await supabaseServer
    .from("users")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  const { data, error } = await supabaseServer
    .from("openers")
    .insert({ user_id: userId, text: opener, score, feedback })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}