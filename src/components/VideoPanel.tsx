import { useEffect, useRef, type RefObject } from "react";
import { MicOff, VideoOff, User } from "lucide-react";

interface VideoPanelProps {
  videoRef: RefObject<HTMLVideoElement>;
  label: string;
  isLocal: boolean;
  cameraOn: boolean;
  micOn: boolean;
  hasStream: boolean;
  mirrored?: boolean;
  placeholderText?: string;
}

export default function VideoPanel({
  videoRef,
  label,
  isLocal,
  cameraOn,
  micOn,
  hasStream,
  mirrored = false,
  placeholderText = "Waiting for video...",
}: VideoPanelProps) {
  const ref = videoRef as RefObject<HTMLVideoElement>;
  const innerRef = useRef<HTMLVideoElement>(null);

  // Keep the forwarded ref and the local ref in sync.
  useEffect(() => {
    if (typeof ref !== "function") {
      (ref as React.MutableRefObject<HTMLVideoElement | null>).current =
        innerRef.current;
    }
  });

  const showPlaceholder = !hasStream || (isLocal && !cameraOn);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
      <video
        ref={innerRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`h-full w-full object-cover ${mirrored ? "-scale-x-100" : ""}`}
      />

      {/* Top label */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span className="chip bg-ink-950/60 text-white backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLocal ? "bg-brand-400" : "bg-accent-400"
            }`}
          />
          {label}
        </span>
      </div>

      {/* Status indicators */}
      <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
        {!micOn && (
          <span className="chip bg-rose-500/80 text-white">
            <MicOff className="h-3 w-3" /> Muted
          </span>
        )}
        {isLocal && !cameraOn && (
          <span className="chip bg-amber-500/80 text-ink-950">
            <VideoOff className="h-3 w-3" /> Cam off
          </span>
        )}
      </div>

      {/* Placeholder overlay */}
      {showPlaceholder && (
        <div className="absolute inset-0 grid place-items-center bg-ink-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 border border-white/10">
              <User className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400">{placeholderText}</p>
          </div>
        </div>
      )}

      {/* Subtle gradient vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
    </div>
  );
}
