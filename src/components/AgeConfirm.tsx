import { useState } from "react";
import { ShieldCheck } from "lucide-react";

interface AgeConfirmProps {
  onConfirm: () => void;
}

export default function AgeConfirm({ onConfirm }: AgeConfirmProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-strong w-full max-w-md rounded-2xl p-6 text-center shadow-2xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/20 text-brand-300">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-white">
          Age confirmation
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Strangerly is intended for adults. Please confirm you meet the minimum
          age requirement before continuing.
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-brand-500"
          />
          <span className="text-sm text-slate-200">
            I confirm that I meet the minimum age requirement to use this service.
          </span>
        </label>

        <button
          onClick={onConfirm}
          disabled={!checked}
          className="btn-primary mt-5 w-full py-3 text-sm"
        >
          Continue to Strangerly
        </button>
      </div>
    </div>
  );
}
