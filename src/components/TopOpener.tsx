"use client"

import { OpenerType } from "@/types"
import { AlertCircle, Check, Save } from "lucide-react"
import { useState } from "react"
import CopyToClipboard from "./CopyToClipboard"

export default function TopOpener({ opener }: { opener: OpenerType }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opener_id: opener.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/6">
      <p
        className="text-white/80 text-base leading-relaxed mb-3"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {opener.text}
      </p>

      <div className="flex items-center justify-between gap-2">
        {/* Score badge */}
        <span
          className="text-xs font-bold px-2 py-1 rounded-lg"
          style={{
            background: `rgba(74, 222, 128, 0.1)`,
            color: "#4ade80",
          }}
        >
          {opener.score}/10
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {error && (
            <span title={error}>
              <AlertCircle size={14} className="text-red-400/70" />
            </span>
          )}

          {saved ? (
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-green-400">
              <Check size={14} />
              <span className="text-xs">Saved</span>
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} className="cursor-pointer"/>
              )}
            </button>
          )}

          <CopyToClipboard text={opener.text} />
        </div>
      </div>
    </div>
  )
}
