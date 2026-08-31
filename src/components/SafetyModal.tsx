import { ShieldCheck, X } from "lucide-react";

interface SafetyModalProps {
  open: boolean;
  onClose: () => void;
}

const GUIDELINES = [
  "Be respectful. Treat strangers the way you'd like to be treated.",
  "Never share passwords, financial information, or your exact location.",
  "No recording. Strangerly does not record video or audio.",
  "No file or image uploads. Keep it to live video and text chat.",
  "Report and block anyone who makes you uncomfortable.",
  "You must meet the minimum age requirement to use this service.",
];

export default function SafetyModal({ open, onClose }: SafetyModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-strong relative w-full max-w-lg rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Community guidelines
            </h2>
            <p className="text-sm text-slate-400">
              Stay safe while meeting new people.
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {GUIDELINES.map((g) => (
            <li key={g} className="flex gap-3 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {g}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="btn-primary mt-6 w-full py-2.5 text-sm">
          I understand
        </button>
      </div>
    </div>
  );
}
