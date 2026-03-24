"use client";

import { Result } from "@/types";
import { getScoreColor } from "@/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

type RatingMode = "basic" | "full";
type DatingApp = "Tinder" | "Hinge" | "Bumble" | "OkCupid" | "Other";

const DATING_APPS: DatingApp[] = ["Tinder", "Hinge", "Bumble", "OkCupid", "Other"];

export default function Home() {
  const [opener, setOpener] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [improving, setImproving] = useState(false);
  const [improved, setImproved] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  // Mode & context
  const [mode, setMode] = useState<RatingMode>("basic");
  const [selectedApp, setSelectedApp] = useState<DatingApp | "">("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  // Credits
  const [credits, setCredits] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedOpenerRef = useRef<string | null>(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchCredits();
  }, [isSignedIn]);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      setCredits(data.credits ?? 0);
    } catch {
      setCredits(0);
    }
  };

  const handleScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setScreenshots(files);
    setScreenshotPreviews(files.map((f) => f.name));
  };

  const removeScreenshot = (i: number) => {
    const next = screenshots.filter((_, idx) => idx !== i);
    setScreenshots(next);
    setScreenshotPreviews(next.map((f) => f.name));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!opener.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    setShared(false);
    setImproved(null);
    savedOpenerRef.current = null;

    try {
      const body: Record<string, unknown> = { opener, mode };
      if (mode === "full") {
        if (selectedApp) body.app = selectedApp;
        if (screenshots.length > 0) {
          body.screenshots = await Promise.all(screenshots.map(toBase64));
        }
      }

      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (mode === "full") fetchCredits();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Returns the saved opener's id, or null on failure
  const saveOpener = async (): Promise<string | null> => {
    if (!result) return null;
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opener, score: result.score, feedback: result.feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      return data.id as string;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
      return null;
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const id = await saveOpener();
    if (id) setSaved(true);
    setSaving(false);
  };

  const handleShare = async () => {
    if (!result) return;
    setSharing(true);
    // Save first (if not already saved), then set is_public: true
    let openerIdToShare = savedOpenerRef.current;
    if (!openerIdToShare) {
      openerIdToShare = await saveOpener();
      if (openerIdToShare) {
        setSaved(true);
        savedOpenerRef.current = openerIdToShare;
      }
    }
    if (!openerIdToShare) { setSharing(false); return; }
    try {
      const res = await fetch("/api/opener", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: openerIdToShare, is_public: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to share.");
      setShared(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to share.");
    } finally {
      setSharing(false);
    }
  };

  const handleImprove = async () => {
    if (!result) return;
    setImproving(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opener, feedback: result.feedback }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImproved(data.improved);
      fetchCredits();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to improve opener.");
    } finally {
      setImproving(false);
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
    setShared(false);
    setImproved(null);
    setMode("basic");
    setSelectedApp("");
    setScreenshots([]);
    setScreenshotPreviews([]);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const canSave = result && result.score >= 7;
  const canShare = result && result.score >= 7;
  const hasEnoughCreditsForFull = credits === null || credits >= 3;
  const hasEnoughCreditsForImprove = credits === null || credits >= 2;

  return (
    <>
      {/* Header */}
      <div className="relative z-10 mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI-powered and trained on battle-tested dating app openers that actually get replies
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

        {/* Credits badge */}
        {isSignedIn && credits !== null && (
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/50">
            <span>🔥</span>
            <span>{credits} Flames</span>
            <button
              className="ml-1 text-pink-400/70 hover:text-pink-400 transition-colors cursor-pointer"
              onClick={() => {/* TODO: open purchase modal */}}
            >
              + Buy
            </button>
          </div>
        )}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
          {!result ? (
            <>
              {/* Mode toggle */}
              <div className="flex gap-2 p-4 pb-0">
                <button
                  onClick={() => setMode("basic")}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={{
                    background: mode === "basic" ? "rgba(255,255,255,0.08)" : "transparent",
                    color: mode === "basic" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
                    border: mode === "basic" ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  }}
                >
                  Basic rating
                  <span className="ml-1 text-white/30">· Free</span>
                </button>

                {isSignedIn ? (
                  <button
                    onClick={() => setMode("full")}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      background: mode === "full"
                        ? "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))"
                        : "transparent",
                      color: mode === "full" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                      border: mode === "full"
                        ? "1px solid rgba(236,72,153,0.3)"
                        : "1px solid transparent",
                    }}
                  >
                    🔥 Full context
                    <span className="ml-1 text-pink-400/60">· 3 Flames</span>
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                      style={{
                        background: "transparent",
                        color: "rgba(255,255,255,0.25)",
                        border: "1px solid transparent",
                      }}
                    >
                      🔥 Full context
                      <span className="ml-1 text-pink-400/40">· Sign in</span>
                    </button>
                  </SignInButton>
                )}
              </div>

              {/* Full context options */}
              {mode === "full" && (
                <div className="px-4 pt-3 space-y-3">
                  {/* App selector */}
                  <div>
                    <p className="text-xs text-white/30 mb-2 uppercase tracking-widest">Dating app</p>
                    <div className="flex flex-wrap gap-2">
                      {DATING_APPS.map((app) => (
                        <button
                          key={app}
                          onClick={() => setSelectedApp(selectedApp === app ? "" : app)}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
                          style={{
                            background: selectedApp === app
                              ? "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.25))"
                              : "rgba(255,255,255,0.05)",
                            color: selectedApp === app ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                            border: selectedApp === app
                              ? "1px solid rgba(236,72,153,0.35)"
                              : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <p className="text-xs text-white/30 mb-2 uppercase tracking-widest">
                      Profile screenshots{" "}
                      <span className="text-white/20 normal-case">(optional, up to 3)</span>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      multiple
                      className="hidden"
                      onChange={handleScreenshots}
                    />
                    {screenshotPreviews.length === 0 ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 rounded-xl text-xs text-white/30 border border-dashed border-white/10 hover:border-white/20 hover:text-white/50 transition-all cursor-pointer"
                      >
                        + Upload their profile photos &amp; bio
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        {screenshotPreviews.map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/8"
                          >
                            <span className="text-xs text-white/50 truncate max-w-[80%]">
                              📎 {name}
                            </span>
                            <button
                              onClick={() => removeScreenshot(i)}
                              className="text-white/20 hover:text-white/50 transition-colors cursor-pointer text-xs ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {screenshotPreviews.length < 3 && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-white/25 hover:text-white/40 transition-colors cursor-pointer"
                          >
                            + Add more
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/5" />
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={opener}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your opener here..."
                  rows={5}
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
                <span className="text-xs text-white/20 hidden sm:block">⌘ + Enter to submit</span>

                {mode === "full" && !hasEnoughCreditsForFull ? (
                  <button
                    className="ml-auto px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-white/50"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onClick={() => {/* TODO: open buy credits modal */}}
                  >
                    Not enough 🔥 — Buy Flames
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!opener.trim() || loading}
                    className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: opener.trim() && !loading
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
                    ) : mode === "full" ? (
                      <>Rate it · 3 🔥</>
                    ) : (
                      <>Rate it →</>
                    )}
                  </button>
                )}
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
                      style={{ color: getScoreColor(result.score), fontFamily: "'Georgia', serif" }}
                    >
                      {result.score}
                    </span>
                    <span className="text-white/30 text-xs">/10</span>
                  </div>
                </div>
                <span className="text-lg font-semibold tracking-wide" style={{ color: getScoreColor(result.score) }}>
                  {getScoreLabel(result.score)} Opener
                </span>
              </div>

              {/* Original opener */}
              <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/30 mb-1 uppercase tracking-widest">Your opener</p>
                <p className="text-white/70 text-sm italic" style={{ fontFamily: "'Georgia', serif" }}>
                  {opener}
                </p>
              </div>

              {/* Feedback */}
              <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/30 mb-1 uppercase tracking-widest">Feedback</p>
                <p className="text-white/80 text-sm leading-relaxed">{result.feedback}</p>
              </div>

              {/* Improved opener */}
              {improved && (
                <div className="mb-4 px-4 py-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                  <p className="text-xs text-purple-400/60 mb-1 uppercase tracking-widest">✨ Improved opener</p>
                  <p className="text-white/85 text-sm italic leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                    {improved}
                  </p>
                </div>
              )}

              {/* Improve button */}
              {!improved && (
                isSignedIn ? (
                  <button
                    onClick={handleImprove}
                    disabled={improving || !hasEnoughCreditsForImprove}
                    className="w-full mb-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.12))",
                      color: "rgba(196,181,253,0.9)",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                  >
                    {improving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                        Improving...
                      </>
                    ) : !hasEnoughCreditsForImprove ? (
                      <>Not enough 🔥 to improve</>
                    ) : (
                      <>✨ Improve this opener · 2 🔥</>
                    )}
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="w-full mb-2 py-2.5 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.12))",
                        color: "rgba(196,181,253,0.9)",
                        border: "1px solid rgba(139,92,246,0.25)",
                      }}
                    >
                      ✨ Sign in to improve opener · 2 🔥
                    </button>
                  </SignInButton>
                )
              )}

              {/* Save + Share row */}
              {canSave && (
                <div className="flex gap-2 mb-2">
                  {isSignedIn ? (
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                      style={{
                        background: saved ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.06)",
                        color: saved ? "rgb(134,239,172)" : "rgba(255,255,255,0.55)",
                        border: saved ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {saved ? "✓ Saved" : saving ? "Saving..." : "Save opener"}
                    </button>
                  ) : (
                    <SignInButton mode="modal">
                      <button
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        Sign in to save
                      </button>
                    </SignInButton>
                  )}

                  {canShare && (
                    isSignedIn ? (
                      <button
                        onClick={handleShare}
                        disabled={sharing || shared}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                        style={{
                          background: shared
                            ? "rgba(236,72,153,0.08)"
                            : "linear-gradient(135deg, rgba(236,72,153,0.14), rgba(139,92,246,0.14))",
                          color: shared ? "rgb(249,168,212)" : "rgba(255,255,255,0.7)",
                          border: shared
                            ? "1px solid rgba(236,72,153,0.25)"
                            : "1px solid rgba(236,72,153,0.18)",
                        }}
                      >
                        {shared ? "🔥 Shared!" : sharing ? "Sharing..." : "🔥 Share it"}
                      </button>
                    ) : (
                      <SignInButton mode="modal">
                        <button
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                          style={{
                            background: "linear-gradient(135deg, rgba(236,72,153,0.14), rgba(139,92,246,0.14))",
                            color: "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(236,72,153,0.18)",
                          }}
                        >
                          Sign in to share
                        </button>
                      </SignInButton>
                    )
                  )}
                </div>
              )}

              {result.score < 7 && (
                <p className="text-center text-xs text-white/20 mb-3">
                  Score 7+ to save or share this opener
                </p>
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

        {error && <p className="mt-3 text-center text-red-400/80 text-sm">{error}</p>}
      </div>

      <p className="relative z-10 mt-10 text-white/15 text-xs text-center">
        Be honest, be interesting, be yourself
      </p>
    </>
  );
}