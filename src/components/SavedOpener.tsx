"use client"

import { getScoreColor } from "@/utils"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { OpenerType } from "../types/index"
import CopyToClipboard from "./CopyToClipboard"

const EARN_BACK_THRESHOLD = 5

export default function SavedOpener({
  opener,
  isBookmarked,
}: {
  opener: OpenerType
  isBookmarked: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(opener.is_public)
  const [error, setError] = useState("")
  const { user } = useUser()

  const scoreColor = getScoreColor(opener.score)
  const bookmarkCount = opener.bookmark_count ?? 0
  const earnedCredits = Math.floor(bookmarkCount / EARN_BACK_THRESHOLD)
  const progressToNext = bookmarkCount % EARN_BACK_THRESHOLD

  const handleClick = async () => {
    if (!user) return

    setLoading(true)
    setError("")
    setIsPublic((prev) => !prev)

    try {
      const res = await fetch("/api/opener", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: opener.id, is_public: !isPublic }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
    } catch (e: unknown) {
      setIsPublic((prev) => !prev)
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-white/6">
      {/* Score accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ background: scoreColor }}
      />

      {/* Opener text */}
      <p
        className="p-5 pb-3 text-white/80 text-base leading-relaxed"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {opener.text}
      </p>

      {/* Bottom row */}
      <div className="px-5 pb-4 flex flex-row items-center justify-between gap-3">
        {/* Score badge */}
        <div className="flex items-center gap-2">
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: `conic-gradient(${scoreColor} ${opener.score * 10}%, rgba(255,255,255,0.05) 0%)`,
            }}
          >
            <div className="absolute inset-0.75 rounded-full bg-[#1a1a24] flex items-center justify-center">
              <span
                className="text-[10px] font-bold"
                style={{ color: "white", fontFamily: "'Georgia', serif" }}
              >
                {opener.score}
              </span>
            </div>
          </div>
          <span className="text-xs text-white/30">/10</span>

          {/* Bookmark count badge — only on public openers the user owns */}
          {isPublic && !isBookmarked && bookmarkCount > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: "rgba(236,72,153,0.08)",
                border: "1px solid rgba(236,72,153,0.15)",
                color: "rgba(249,168,212,0.7)",
              }}
              title={`${bookmarkCount} bookmark${bookmarkCount !== 1 ? "s" : ""}`}
            >
              🔖 {bookmarkCount}
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <CopyToClipboard text={opener.text} />

          {!isBookmarked && (
            <button
              onClick={handleClick}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isPublic
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(135deg, #ec4899, #8b5cf6)",
                color: isPublic ? "rgba(255,255,255,0.4)" : "white",
                border: isPublic ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}
            >
              {loading ? (
                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : isPublic ? (
                "Make private"
              ) : (
                "Share with others 🔥"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Public indicator + earn-back progress */}
      {isPublic && !isBookmarked && (
        <div className="px-5 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400/60">Visible in Top Openers</span>
            </div>

            {/* Earn-back indicator */}
            {bookmarkCount > 0 && (
              <span className="text-xs text-white/25">
                {earnedCredits > 0
                  ? `🔥 +${earnedCredits} Flame${earnedCredits !== 1 ? "s" : ""} earned`
                  : `${progressToNext}/${EARN_BACK_THRESHOLD} to earn a Flame`}
              </span>
            )}
          </div>

          {/* Progress bar toward next flame */}
          {bookmarkCount > 0 && earnedCredits === 0 && (
            <div className="w-full h-0.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(progressToNext / EARN_BACK_THRESHOLD) * 100}%`,
                  background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="px-5 pb-4 text-xs text-red-400/70">{error}</p>}
    </div>
  )
}