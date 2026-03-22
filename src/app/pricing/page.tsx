"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  return (
    <div className="relative z-10 w-full max-w-sm pt-16 text-center">
      <h1
        className="text-3xl font-bold text-white mb-3"
        style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
      >
        Unlock Top Openers
      </h1>
      <p className="text-white/40 text-sm mb-8 leading-relaxed">
        Get access to the best openers rated 8+ that actually get replies.
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
        <p className="text-white/30 text-xs mb-6">Lifetime access</p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
        >
          {loading ? "Redirecting..." : "Get Access →"}
        </button>
      </div>

      <p className="text-white/20 text-xs">Secure payment via Paddle</p>
    </div>
  );
}
