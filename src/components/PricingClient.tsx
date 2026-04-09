"use client"

import { useState } from "react"

const FLAME_PACKS = [
  { id: "flames_10", label: "10 Flames", price: "$1.99", flames: 10 },
  {
    id: "flames_30",
    label: "30 Flames",
    price: "$4.99",
    flames: 30,
    popular: true,
  },
  { id: "flames_100", label: "100 Flames", price: "$12.99", flames: 100 },
]

export default function PricingClient() {
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const handleCheckout = async (item: string) => {
    setLoadingItem(item)
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoadingItem(null)
  }

  return (
    <div className="relative z-10 w-full max-w-md pt-16 text-center">
      <h1
        className="text-3xl font-bold text-white mb-3"
        style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
      >
        Level up your game
      </h1>
      <p className="text-white/40 text-sm mb-10 leading-relaxed">
        Use Flames for full context ratings and improvements. Or unlock the Top
        Openers vault forever.
      </p>

      {/* Flames packs */}
      <p className="text-xs text-white/30 uppercase tracking-widest mb-3 text-left">
        🔥 Flames — pay per use
      </p>
      <div className="space-y-3 mb-8">
        {FLAME_PACKS.map((pack) => (
          <div
            key={pack.id}
            className="relative rounded-2xl border bg-white/4 backdrop-blur-xl p-5 flex items-center justify-between"
            style={{
              borderColor: pack.popular
                ? "rgba(236,72,153,0.35)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            {pack.popular && (
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  color: "white",
                }}
              >
                Most popular
              </span>
            )}

            <div className="text-left">
              <p className="text-white/80 text-sm font-semibold">
                {pack.label}
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                Full context · {Math.floor(pack.flames / 3)}x or Improve ·{" "}
                {Math.floor(pack.flames / 2)}x
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Georgia', serif",
                  color: pack.popular ? "rgb(249,168,212)" : "white",
                }}
              >
                {pack.price}
              </span>
              <button
                onClick={() => handleCheckout(pack.id)}
                disabled={loadingItem !== null}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
                style={{
                  background: pack.popular
                    ? "linear-gradient(135deg, #ec4899, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                  border: pack.popular
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {loadingItem === pack.id ? "..." : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Top Openers one-time */}
      <p className="text-xs text-white/30 uppercase tracking-widest mb-3 text-left">
        ⚡ Top Openers — one-time unlock
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-6 mb-6">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
          One time payment
        </p>
        <p
          className="text-5xl font-bold text-white mb-1"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          $4.99
        </p>
        <p className="text-white/30 text-xs mb-6">
          Lifetime access to openers rated 8+ that actually get replies
        </p>

        <button
          onClick={() => handleCheckout("top_openers")}
          disabled={loadingItem !== null}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
        >
          {loadingItem === "top_openers" ? "Redirecting..." : "Get Access →"}
        </button>
      </div>

      <p className="text-white/20 text-xs">Secure payment via Paddle</p>
    </div>
  )
}
