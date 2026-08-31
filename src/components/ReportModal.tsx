import { useState } from "react";
import { Flag, X } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail: string) => void;
}

const REASONS = [
  { id: "harassment", label: "Harassment" },
  { id: "nudity", label: "Nudity / sexual content" },
  { id: "hate", label: "Hate / abuse" },
  { id: "spam", label: "Spam" },
  { id: "other", label: "Other" },
];

export default function ReportModal({ open, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function handleSubmit() {
    if (!reason) return;
    onSubmit(reason, detail);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason("");
      setDetail("");
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-strong relative w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
            <Flag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Report this stranger
            </h2>
            <p className="text-sm text-slate-400">
              Help us keep Strangerly safe.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl bg-brand-500/15 border border-brand-400/30 px-4 py-6 text-center">
            <p className="font-semibold text-brand-300">
              Report received. Thank you.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Our team will review this report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">
                What happened?
              </p>
              <div className="grid gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${
                      reason === r.id
                        ? "border-brand-400/60 bg-brand-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        reason === r.id
                          ? "border-brand-400 bg-brand-400"
                          : "border-slate-500"
                      }`}
                    />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">
                Details (optional)
              </p>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Add any context..."
                className="input resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason}
                className="btn-danger flex-1 py-2.5 text-sm"
              >
                Submit report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
