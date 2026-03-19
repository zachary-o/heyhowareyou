import SavedOpener from "@/components/SavedOpener";
import { supabaseServer } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function SavedPage() {
  const { userId } = await auth();
   if (!userId) redirect("/sign-in");

  const { data: openers } = await supabaseServer
    .from("openers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end px-5 py-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {openers?.map((opener) => (
          <SavedOpener key={opener.id} opener={opener} />
        ))}
      </div>
    </div>
  );
}
