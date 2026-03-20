import TopOpener from "@/components/TopOpener";
import { supabaseServer } from "@/lib/supabase-server";
import { OpenerType } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ExplorePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabaseServer
    .from("users")
    .select("is_premium")
    .eq("id", userId)
    .single();

  if (!user?.is_premium) redirect("/pricing");

  const { data: openers } = await supabaseServer
    .from("openers")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (openers?.length === 0) {
    return (
      <div className="relative z-10 text-center pt-32">
        <p className="text-4xl mb-3">🏜️</p>
        <p
          className="text-white/60 text-lg mb-2"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          No public openers yet
        </p>
        <p className="text-white/30 text-sm">
          Be the first - rate an opener and share it with others.
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-lg pt-16">
      <div className="mb-8 text-center">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
        >
          Top Openers 🔥
        </h1>
        <p className="text-white/40 text-sm">
          Battle-tested openers that actually get replies
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {openers?.length === 0 && (
          <p className="text-center text-white/30 text-sm">
            No public openers yet.
          </p>
        )}
        {openers?.map((opener: OpenerType) => (
          <TopOpener key={opener.id} opener={opener} />
        ))}
      </div>
    </div>
  );
}
