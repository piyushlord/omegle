import { useCallback, useEffect, useRef, useState } from "react";
import {
  createOffer,
  createPeerConnection,
  getUserMediaSafe,
  handleAnswer,
  handleIce,
  handleOffer,
} from "@/services/webrtc";
import type { MatchmakingApi } from "./useMatchmaking";

export interface WebRTCMedia {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  micOn: boolean;
  cameraOn: boolean;
  mediaReady: boolean;
  mediaError: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  startMedia: () => Promise<void>;
  stopMedia: () => void;
  cleanupConnection: () => void;
}

export function useWebRTC(mm: MatchmakingApi): WebRTCMedia {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const startMedia = useCallback(async () => {
    try {
      const stream = await getUserMediaSafe();
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setMediaReady(true);
      setMediaError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not access camera or microphone.";
      setMediaError(message);
      setMediaReady(false);
    }
  }, []);

  const stopMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setMediaReady(false);
  }, []);

  const cleanupConnection = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audio = stream.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const video = stream.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setCameraOn(video.enabled);
    }
  }, []);

  // Wire up signaling event handlers once.
  useEffect(() => {
    const socket = mm.socket;
    if (!socket) return;

    mm.onMatched(async (payload) => {
      mm.clearMessages();
      cleanupConnection();
      const stream = localStreamRef.current;
      if (!stream) return;

      const pc = createPeerConnection(
        stream,
        socket,
        remoteVideoRef,
        () => mm.setStatus("connected"),
        () => {}
      );
      pcRef.current = pc;

      if (payload.initiator) {
        await createOffer(pc, socket);
      }
    });

    mm.onOffer(async (sdp) => {
      const stream = localStreamRef.current;
      if (stream && !pcRef.current) {
        // Create pc lazily if offer arrives before matched handler set it.
        const pc = createPeerConnection(
          stream,
          socket,
          remoteVideoRef,
          () => mm.setStatus("connected"),
          () => {}
        );
        pcRef.current = pc;
        await handleOffer(pc, socket, sdp);
        return;
      }
      if (pcRef.current) await handleOffer(pcRef.current, socket, sdp);
    });

    mm.onAnswer(async (sdp) => {
      if (pcRef.current) await handleAnswer(pcRef.current, sdp);
    });

    mm.onIce(async (candidate) => {
      if (pcRef.current) await handleIce(pcRef.current, candidate);
    });

    mm.onPartnerLeft(() => {
      cleanupConnection();
      mm.setStatus("partner_left");
    });

    socket.on("server:searching", () => mm.setStatus("searching"));
    socket.on("server:matched", () => mm.setStatus("connecting"));
    socket.on("server:error", (p: { message: string }) => {
      console.warn("socket error:", p.message);
    });

    return () => {
      socket.off("server:matched");
      socket.off("server:offer");
      socket.off("server:answer");
      socket.off("server:ice");
      socket.off("server:partner_left");
      socket.off("server:searching");
      socket.off("server:error");
    };
  }, [mm, cleanupConnection]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    micOn,
    cameraOn,
    mediaReady,
    mediaError,
    toggleMic,
    toggleCamera,
    startMedia,
    stopMedia,
    cleanupConnection,
  };
}
