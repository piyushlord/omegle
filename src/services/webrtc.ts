import type { Socket } from "socket.io-client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
];

export interface WebRTCController {
  localStream: MediaStream;
  pc: RTCPeerConnection;
  setRemoteVideo: (el: HTMLVideoElement | null) => void;
  setLocalVideo: (el: HTMLVideoElement | null) => void;
  toggleMic: () => boolean;
  toggleCamera: () => boolean;
  close: () => void;
}

export interface SignalingCallbacks {
  onOffer: (cb: (sdp: RTCSessionDescriptionInit) => void) => void;
  onAnswer: (cb: (sdp: RTCSessionDescriptionInit) => void) => void;
  onIce: (cb: (candidate: RTCIceCandidateInit) => void) => void;
  onPartnerLeft: (cb: (payload: { reason: string }) => void) => void;
  sendOffer: (sdp: RTCSessionDescriptionInit) => void;
  sendAnswer: (sdp: RTCSessionDescriptionInit) => void;
  sendIce: (candidate: RTCIceCandidateInit) => void;
}

export async function getUserMediaSafe(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  return stream;
}

export function createPeerConnection(
  localStream: MediaStream,
  socket: Socket,
  remoteVideoRef: React.MutableRefObject<HTMLVideoElement | null>,
  onConnected: () => void,
  onDisconnected: () => void
): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  for (const track of localStream.getTracks()) {
    pc.addTrack(track, localStream);
  }

  pc.ontrack = (event) => {
    const el = remoteVideoRef.current;
    if (el && event.streams[0]) {
      el.srcObject = event.streams[0];
      el.play().catch(() => {});
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") onConnected();
    if (
      pc.connectionState === "disconnected" ||
      pc.connectionState === "failed"
    ) {
      onDisconnected();
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("client:ice", { candidate: event.candidate.toJSON() });
    }
  };

  return pc;
}

export async function createOffer(
  pc: RTCPeerConnection,
  socket: Socket
): Promise<void> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("client:offer", { sdp: offer });
}

export async function handleOffer(
  pc: RTCPeerConnection,
  socket: Socket,
  sdp: RTCSessionDescriptionInit
): Promise<void> {
  await pc.setRemoteDescription(sdp);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("client:answer", { sdp: answer });
}

export async function handleAnswer(
  pc: RTCPeerConnection,
  sdp: RTCSessionDescriptionInit
): Promise<void> {
  await pc.setRemoteDescription(sdp);
}

export async function handleIce(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  try {
    await pc.addIceCandidate(candidate);
  } catch {
    // Ignore late candidates after connection teardown.
  }
}
