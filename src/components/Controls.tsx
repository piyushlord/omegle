import {
  ArrowRight,
  Flag,
  Ban,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";

interface ControlsProps {
  micOn: boolean;
  cameraOn: boolean;
  connected: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReport: () => void;
  onBlock: () => void;
}

export default function Controls({
  micOn,
  cameraOn,
  connected,
  onToggleMic,
  onToggleCamera,
  onNext,
  onEnd,
  onReport,
  onBlock,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={onToggleMic}
        className={`btn h-12 w-12 rounded-full ${
          micOn
            ? "bg-white/10 hover:bg-white/15 text-white"
            : "bg-rose-500/90 hover:bg-rose-400 text-white"
        }`}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        title={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>

      <button
        onClick={onToggleCamera}
        className={`btn h-12 w-12 rounded-full ${
          cameraOn
            ? "bg-white/10 hover:bg-white/15 text-white"
            : "bg-rose-500/90 hover:bg-rose-400 text-white"
        }`}
        aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        title={cameraOn ? "Camera off" : "Camera on"}
      >
        {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </button>

      <button
        onClick={onNext}
        disabled={!connected}
        className="btn h-12 rounded-full bg-brand-500 hover:bg-brand-400 px-5 text-ink-950 shadow-lg shadow-brand-500/20 disabled:opacity-40"
        title="Skip to next stranger"
      >
        <ArrowRight className="h-5 w-5" />
        <span className="font-bold">Next</span>
      </button>

      <button
        onClick={onEnd}
        className="btn h-12 rounded-full bg-rose-500 hover:bg-rose-400 px-5 text-white"
        title="End chat"
      >
        <PhoneOff className="h-5 w-5" />
        <span className="font-bold">End</span>
      </button>

      <button
        onClick={onReport}
        disabled={!connected}
        className="btn h-12 w-12 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 disabled:opacity-40"
        title="Report stranger"
        aria-label="Report stranger"
      >
        <Flag className="h-5 w-5" />
      </button>

      <button
        onClick={onBlock}
        disabled={!connected}
        className="btn h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40"
        title="Block stranger"
        aria-label="Block stranger"
      >
        <Ban className="h-5 w-5" />
      </button>
    </div>
  );
}
