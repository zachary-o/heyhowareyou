"use client";

import { Result } from "@/types";
import { getScoreColor } from "@/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [opener, setOpener] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!opener.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opener, save: false }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opener,
          score: result.score,
          feedback: result.feedback,
        }),
      });
      setSaved(true);
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOpener(e.target.value);
    setCharCount(e.target.value.length);
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return "Weak";
    if (score <= 6) return "Average";
    return "Strong";
  };

  const reset = () => {
    setResult(null);
    setOpener("");
    setCharCount(0);
    setSaved(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const canSave = result && result.score > 7;

  return (
    <>
      {/* Header */}
      <div className="relative z-10 mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI-powered and trained on battle-tested dating app openers that
          actually get replies
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
        >
          Rate My Opener
        </h1>
        <p className="text-white/40 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Paste your first message. Get brutal, honest feedback in seconds.
        </p>
      </div>
      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
          {!result ? (
            <>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={opener}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your opener here..."
                  rows={6}
                  maxLength={500}
                  className="w-full bg-transparent text-white/90 placeholder-white/20 resize-none p-5 pb-3 text-base sm:text-lg focus:outline-none leading-relaxed"
                  style={{ fontFamily: "'Georgia', serif" }}
                />
                <div className="px-5 pb-2 text-right text-xs text-white/20">
                  {charCount}/500
                </div>
              </div>

              <div className="h-px bg-white/10 mx-5" />

              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-xs text-white/20 hidden sm:block">
                  ⌘ + Enter to submit
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!opener.trim() || loading}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background:
                      opener.trim() && !loading
                        ? "linear-gradient(135deg, #ec4899, #8b5cf6)"
                        : "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Rate it →</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 sm:p-8">
              {/* Score ring */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="relative w-28 h-28 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: `conic-gradient(${getScoreColor(result.score)} ${result.score * 10}%, rgba(255,255,255,0.05) 0%)`,
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-[#0a0a0f] flex flex-col items-center justify-center">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color: getScoreColor(result.score),
                        fontFamily: "'Georgia', serif",
                      }}
                    >
                      {result.score}
                    </span>
                    <span className="text-white/30 text-xs">/10</span>
                  </div>
                </div>
                <span
                  className="text-lg font-semibold tracking-wide"
                  style={{ color: getScoreColor(result.score) }}
                >
                  {getScoreLabel(result.score)} Opener
                </span>
              </div>

              {/* Original opener */}
              <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/30 mb-1 uppercase tracking-widest">
                  Your opener
                </p>
                <p
                  className="text-white/70 text-sm italic"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {`${opener}`}
                </p>
              </div>

              {/* Feedback */}
              <div className="mb-5 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/30 mb-1 uppercase tracking-widest">
                  Feedback
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {result.feedback}
                </p>
              </div>

              {/* Save section — only if score > 7 */}
              {canSave && (
                <div className="mb-4 px-4 py-3 rounded-xl border border-green-500/20 bg-green-500/5">
                  <p className="text-xs text-green-400/60 mb-2 uppercase tracking-widest">
                    🔥 Great opener!
                  </p>
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                      <button className="w-full py-2 rounded-lg text-sm font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-all cursor-pointer">
                        Sign in to save this opener
                      </button>
                    </SignInButton>
                  ) : saved ? (
                    <p className="text-center text-sm text-green-400">
                      ✓ Saved to your collection!
                    </p>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-2 rounded-lg text-sm font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 transition-all disabled:opacity-50"
                      style={{ cursor: saving ? "not-allowed" : "pointer" }}
                    >
                      {saving ? "Saving..." : "Save this opener"}
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                Try another opener
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-center text-red-400/80 text-sm">{error}</p>
        )}
      </div>
      <p className="relative z-10 mt-10 text-white/15 text-xs text-center">
        Be honest, be interesting, be yourself
      </p>
    </>
  );
}
