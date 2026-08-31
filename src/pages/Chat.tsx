import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Radio, ShieldCheck } from "lucide-react";
import VideoPanel from "@/components/VideoPanel";
import ChatPanel from "@/components/ChatPanel";
import Controls from "@/components/Controls";
import AgeConfirm from "@/components/AgeConfirm";
import ReportModal from "@/components/ReportModal";
import SafetyModal from "@/components/SafetyModal";
import { useMatchmaking, type ConnectionStatus } from "@/hooks/useMatchmaking";
import { useWebRTC } from "@/hooks/useWebRTC";
import type { User } from "firebase/auth";

interface ChatProps {
  user: User;
  onEnd: () => void;
}

const statusCopy: Record<ConnectionStatus, { label: string; color: string }> = {
  idle: { label: "Ready", color: "bg-slate-400" },
  searching: { label: "Finding someone...", color: "bg-amber-400 animate-pulse-soft" },
  connecting: { label: "Connecting...", color: "bg-accent-400 animate-pulse-soft" },
  connected: { label: "Connected", color: "bg-brand-400" },
  partner_left: { label: "Stranger disconnected", color: "bg-slate-400" },
};

export default function Chat({ user, onEnd }: ChatProps) {
  const mm = useMatchmaking(user.uid);
  const rtc = useWebRTC(mm);
  const [ageConfirmed, setAgeConfirmed] = useState(
    () => sessionStorage.getItem("strangerly:age-confirmed") === "true"
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState(false);

  const currentStatus = statusCopy[mm.status];
  const connected = mm.status === "connected";

  useEffect(() => {
    if (ageConfirmed && !rtc.mediaReady) {
      void rtc.startMedia();
    }
  }, [ageConfirmed, rtc.mediaReady, rtc.startMedia]);

  function confirmAge() {
    sessionStorage.setItem("strangerly:age-confirmed", "true");
    setAgeConfirmed(true);
  }

  function startSearching() {
    if (!rtc.mediaReady) return;
    mm.startSearch(mm.blockedIds);
  }

  function nextStranger() {
    rtc.cleanupConnection();
    mm.next();
  }

  function endChat() {
    rtc.cleanupConnection();
    mm.endChat();
    onEnd();
  }

  function blockStranger() {
    // Block is recorded for this browser session by ending the current chat.
    rtc.cleanupConnection();
    mm.blockCurrentUser();
    mm.next();
    setBlockedNotice(true);
    setTimeout(() => setBlockedNotice(false), 2500);
  }

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint bg-[size:48px_48px] opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[110px]" />

      {!ageConfirmed && <AgeConfirm onConfirm={confirmAge} />}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={mm.reportUser}
      />
      <SafetyModal open={safetyOpen} onClose={() => setSafetyOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-brand-400" />
              <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
                Random chat
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Meet someone new. Be kind. Stay curious.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip border border-white/10 bg-white/[0.04] text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.color}`} />
              {currentStatus.label}
            </span>
            <button
              onClick={() => setSafetyOpen(true)}
              className="btn-ghost px-3 py-2 text-xs"
            >
              <ShieldCheck className="h-4 w-4 text-brand-300" />
              Safety
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="grid gap-3 sm:grid-cols-2">
              <VideoPanel
                videoRef={rtc.localVideoRef}
                label="You"
                isLocal
                cameraOn={rtc.cameraOn}
                micOn={rtc.micOn}
                hasStream={rtc.mediaReady}
                mirrored
                placeholderText={rtc.mediaError ? "Camera access needed" : "Your camera"}
              />
              <VideoPanel
                videoRef={rtc.remoteVideoRef}
                label="Stranger"
                isLocal={false}
                cameraOn
                micOn
                hasStream={connected}
                placeholderText={
                  mm.status === "searching"
                    ? "Looking around the world..."
                    : mm.status === "partner_left"
                      ? "They left the chat"
                      : "Your next conversation starts here"
                }
              />
            </div>

            {rtc.mediaError && (
              <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                We need access to your camera and microphone. Please allow access in
                your browser, then refresh the page.
              </div>
            )}

            <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 sm:px-5">
              <Controls
                micOn={rtc.micOn}
                cameraOn={rtc.cameraOn}
                connected={connected}
                onToggleMic={rtc.toggleMic}
                onToggleCamera={rtc.toggleCamera}
                onNext={nextStranger}
                onEnd={endChat}
                onReport={() => setReportOpen(true)}
                onBlock={blockStranger}
              />
              {blockedNotice && (
                <p className="text-xs text-brand-300 animate-fade-in">
                  Stranger blocked. Finding someone new...
                </p>
              )}
            </div>

            {mm.status === "idle" && (
              <div className="mt-5 flex flex-col items-center rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-6 text-center animate-fade-in">
                <h2 className="font-display text-lg font-bold text-white">
                  Ready when you are
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  Your camera preview is private until you choose to start.
                </p>
                <button
                  onClick={startSearching}
                  disabled={!rtc.mediaReady}
                  className="btn-primary mt-4 px-6 py-3 text-sm"
                >
                  Find a stranger
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {mm.status === "searching" && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-slate-300 animate-fade-in">
                <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                Finding someone interesting...
              </div>
            )}

            {mm.status === "partner_left" && (
              <div className="mt-5 flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center animate-fade-in">
                <p className="text-sm text-slate-300">Your stranger disconnected.</p>
                <button onClick={nextStranger} className="btn-primary mt-3 px-5 py-2.5 text-sm">
                  Find next stranger
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          <aside className="h-[440px] lg:h-auto lg:min-h-[520px]">
            <ChatPanel
              messages={mm.messages}
              onSend={mm.sendMessage}
              disabled={!connected}
            />
          </aside>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-slate-600">
          Never share passwords, financial information, or your exact location. If
          someone makes you uncomfortable, end the chat, block, and report them.
        </p>
      </main>
    </div>
  );
}
