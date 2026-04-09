import SavedOpener from "@/components/SavedOpener";
import { supabaseServer } from "@/lib/supabase-server";
import { OpenerType } from "@/types";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Openers",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: myOpeners } = await supabaseServer
    .from("openers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: bookmarked } = await supabaseServer
    .from("saved_openers")
    .select("opener_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const openerIds = bookmarked?.map((b) => b.opener_id) ?? [];

  const { data: bookmarkedOpeners } = await supabaseServer
    .from("openers")
    .select("*")
    .in("id", openerIds);

  return (
    <div className="relative z-10 w-full max-w-lg pt-16 pb-12">

      {/* My Openers */}
      <div className="mb-10">
        <h1
          className="text-white/60 text-xs uppercase tracking-widest mb-4 px-1"
        >
          My Openers
        </h1>
        {myOpeners?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p
              className="text-white/60 text-lg mb-2"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              No saved openers yet
            </p>
            <p className="text-white/30 text-sm">
              Rate an opener and save the good ones here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myOpeners?.map((opener: OpenerType) => (
              <SavedOpener key={opener.id} opener={opener} isBookmarked={false} />
            ))}
          </div>
        )}
      </div>

      {/* Bookmarked */}
      <div>
        <h2
          className="text-white/60 text-xs uppercase tracking-widest mb-4 px-1"
        >
          Bookmarked from Explore
        </h2>
        {bookmarkedOpeners?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🔖</p>
            <p
              className="text-white/60 text-lg mb-2"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              No bookmarks yet
            </p>
            <p className="text-white/30 text-sm mb-4">
              Browse top openers and save the ones you like.
            </p>
            <Link
              href="/explore"
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5"
            >
              Browse Top Openers →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookmarkedOpeners?.map((opener: OpenerType) => (
              <SavedOpener key={opener.id} opener={opener} isBookmarked={true}/>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}