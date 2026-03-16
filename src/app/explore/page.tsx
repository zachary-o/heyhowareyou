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

  console.log("openers", openers);

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
          <div
            key={opener.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5"
          >
            <p
              className="text-white/80 text-base leading-relaxed mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {opener.text}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{
                  background: `rgba(74, 222, 128, 0.1)`,
                  color: "#4ade80",
                }}
              >
                {opener.score}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
