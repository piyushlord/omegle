import { useState } from "react";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import type { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export default function Navbar({ user, onLogout, onNavigateHome }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 group"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-600 text-ink-950 shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            Strangerly
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <img
                src={user.photoURL || undefined}
                alt={user.displayName || "You"}
                className="h-9 w-9 rounded-full ring-2 ring-brand-400/40"
                referrerPolicy="no-referrer"
              />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">
                  {user.displayName}
                </p>
                <p className="text-xs text-slate-400">Signed in with Google</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-ghost px-3 py-2 text-sm"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onNavigateHome}
            className="btn-ghost px-4 py-2 text-sm sm:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        {open && (
          <div className="sm:hidden">
            <X className="h-5 w-5" />
          </div>
        )}
      </div>
    </header>
  );
}
