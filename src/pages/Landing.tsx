import {
  ArrowRight,
  Globe2,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";

interface LandingProps {
  onContinueWithGoogle: () => void;
  onStartChatting: () => void;
  authLoading: boolean;
}

export default function Landing({
  onContinueWithGoogle,
  onStartChatting,
  authLoading,
}: LandingProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-accent-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-400/10 blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <span className="chip mx-auto bg-white/[0.05] border border-white/10 text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Anonymous random matching
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Talk to Someone New.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
            Meet interesting people from around the world through instant random
            video chat.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onContinueWithGoogle}
              disabled={authLoading}
              className="btn-primary w-full px-6 py-3.5 text-sm sm:w-auto"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              onClick={onStartChatting}
              className="btn-ghost w-full px-6 py-3.5 text-sm sm:w-auto"
            >
              Start Chatting
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            No recording. No uploads. Peer-to-peer video.
          </p>
        </div>

        {/* Hero preview card */}
        <div className="mx-auto mt-16 max-w-4xl animate-fade-in">
          <div className="glass rounded-3xl p-3 shadow-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900">
                <div className="absolute inset-0 grid place-items-center">
                  <Video className="h-10 w-10 text-slate-600" />
                </div>
                <span className="absolute left-3 top-3 chip bg-ink-950/60 text-white">
                  You
                </span>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-ink-900">
                <div className="absolute inset-0 grid place-items-center">
                  <Globe2 className="h-10 w-10 text-brand-400/50" />
                </div>
                <span className="absolute left-3 top-3 chip bg-ink-950/60 text-white">
                  Stranger
                </span>
                <span className="absolute bottom-3 right-3 chip bg-brand-500/80 text-ink-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-950 animate-pulse-soft" />
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold text-white">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-slate-400">
          Three steps to meeting someone new.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Video,
              title: "Allow camera & mic",
              text: "Grant access so you can see and hear each other. Video stays peer-to-peer.",
            },
            {
              icon: Zap,
              title: "Get matched instantly",
              text: "Our server pairs you with a random stranger. No waiting around.",
            },
            {
              icon: MessageSquare,
              title: "Talk or skip",
              text: "Chat over video and text. Not a good fit? Hit Next to meet someone else.",
            },
          ].map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety + Privacy */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-8">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-white">Safety first</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                Report and block anyone making you uncomfortable.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                Never share passwords, financial info, or your exact location.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                Age confirmation required before chatting.
              </li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-8">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <Lock className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-white">Privacy by design</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                Video and audio travel peer-to-peer, never through our server.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                No recording. No file or image uploads.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400" />
                Chat messages disappear when you move on.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-brand-500/20 blur-[80px]" />
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Ready to meet someone new?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Sign in with Google and start chatting in seconds.
          </p>
          <button
            onClick={onStartChatting}
            className="btn-primary mx-auto mt-8 px-8 py-4 text-sm"
          >
            Start Chatting
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-sm text-slate-500">
        Strangerly — talk to someone new. Built with WebRTC.
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
