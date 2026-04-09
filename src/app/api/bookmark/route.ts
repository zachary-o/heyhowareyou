import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const EARN_BACK_THRESHOLD = 5;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opener_id } = await req.json();

  const { error } = await supabaseServer
    .from("saved_openers")
    .insert({ user_id: userId, opener_id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get current opener data
  const { data: opener } = await supabaseServer
    .from("openers")
    .select("user_id, bookmark_count")
    .eq("id", opener_id)
    .single();

  if (opener) {
    // Increment in DB and get the new count back
    const { data: updated } = await supabaseServer
      .from("openers")
      .update({ bookmark_count: (opener.bookmark_count ?? 0) + 1 })
      .eq("id", opener_id)
      .select("bookmark_count")
      .single();

    const newCount = updated?.bookmark_count ?? 0;

    // Earn-back: every EARN_BACK_THRESHOLD bookmarks → +1 credit to original author
    // Skip if user is bookmarking their own opener
    if (opener.user_id !== userId && newCount % EARN_BACK_THRESHOLD === 0) {
      await supabaseServer.rpc("increment_user_credits", {
        user_id: opener.user_id,
        amount: 1,
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { opener_id } = await req.json();

  const { error } = await supabaseServer
    .from("saved_openers")
    .delete()
    .eq("user_id", userId)
    .eq("opener_id", opener_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}