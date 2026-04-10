"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FLAME_PACKS } from "@/consts";
import { useState } from "react";

export default function BuyFlamesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleCheckout = async (item: string) => {
    setLoadingItem(item);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingItem(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 border-0 shadow-none bg-transparent max-w-sm w-full"
      >
        <div
          className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50"
          style={{
            background: "rgba(10,10,15,0.95)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <DialogTitle
              className="text-white/90 text-lg font-bold"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
            >
              Buy Flames 🔥
            </DialogTitle>
            <DialogDescription className="text-white/30 text-xs mt-1">
              Use Flames for full context ratings and improvements.
            </DialogDescription>
          </div>

          {/* Packs */}
          <div className="p-4 space-y-3">
            {FLAME_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="relative rounded-xl border p-4 flex items-center justify-between"
                style={{
                  borderColor: pack.popular
                    ? "rgba(236,72,153,0.35)"
                    : "rgba(255,255,255,0.08)",
                  background: pack.popular
                    ? "rgba(236,72,153,0.05)"
                    : "rgba(255,255,255,0.03)",
                }}
              >
                {pack.popular && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase text-white"
                    style={{
                      background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                    }}
                  >
                    Most popular
                  </span>
                )}

                <div>
                  <p className="text-white/80 text-sm font-semibold">{pack.label}</p>
                  <p className="text-white/25 text-xs mt-0.5">
                    Full context · {pack.fullUses}x &nbsp;·&nbsp; Improve · {pack.improveUses}x
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-lg font-bold"
                    style={{
                      fontFamily: "'Georgia', serif",
                      color: pack.popular ? "rgb(249,168,212)" : "rgba(255,255,255,0.8)",
                    }}
                  >
                    {pack.price}
                  </span>
                  <button
                    onClick={() => handleCheckout(pack.id)}
                    disabled={loadingItem !== null}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      background: pack.popular
                        ? "linear-gradient(135deg, #ec4899, #8b5cf6)"
                        : "rgba(255,255,255,0.08)",
                      border: pack.popular
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {loadingItem === pack.id ? (
                      <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" />
                    ) : (
                      "Buy"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-1">
            <p className="text-center text-white/20 text-xs">
              Secure payment via Paddle
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}