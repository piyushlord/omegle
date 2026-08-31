import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, type Socket } from "@/services/socket";

export type ConnectionStatus =
  | "idle"
  | "searching"
  | "connecting"
  | "connected"
  | "partner_left";

export interface ChatMessage {
  id: string;
  text: string;
  from: "me" | "stranger";
  timestamp: number;
}

export interface MatchmakingApi {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  messages: ChatMessage[];
  startSearch: (blockedIds: string[]) => void;
  next: () => void;
  endChat: () => void;
  sendMessage: (text: string) => void;
  reportUser: (reason: string, detail: string) => void;
  blockCurrentUser: () => string | null;
  blockedIds: string[];
  socket: Socket | null;
  onMatched: (cb: (payload: { room: string; partnerId: string; initiator: boolean }) => void) => void;
  onPartnerLeft: (cb: (payload: { reason: string }) => void) => void;
  onOffer: (cb: (sdp: RTCSessionDescriptionInit) => void) => void;
  onAnswer: (cb: (sdp: RTCSessionDescriptionInit) => void) => void;
  onIce: (cb: (candidate: RTCIceCandidateInit) => void) => void;
  clearMessages: () => void;
}

const BLOCK_KEY = "strangerly:blocked";

export function useMatchmaking(userId: string | undefined): MatchmakingApi {
  const [status, setStatusState] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(BLOCK_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const socketRef = useRef<Socket | null>(null);
  const currentPartnerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const s = connectSocket(userId);
    socketRef.current = s;
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    sessionStorage.setItem(BLOCK_KEY, JSON.stringify(blockedIds));
    socketRef.current?.emit("client:blocklist", { blockedIds });
  }, [blockedIds]);

  const setStatus = useCallback((nextStatus: ConnectionStatus) => {
    setStatusState(nextStatus);
  }, []);

  const startSearch = useCallback(
    (ids: string[]) => {
      socketRef.current?.emit("client:start_search", { blockedIds: ids });
    },
    []
  );

  const next = useCallback(() => {
    setMessages([]);
    socketRef.current?.emit("client:next");
    setStatus("searching");
  }, []);

  const endChat = useCallback(() => {
    setMessages([]);
    socketRef.current?.emit("client:end_chat");
    setStatus("idle");
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    socketRef.current?.emit("client:message", { text });
  }, []);

  const reportUser = useCallback((reason: string, detail: string) => {
    socketRef.current?.emit("client:report", { reason, detail });
  }, []);

  const blockCurrentUser = useCallback(() => {
    const partnerId = currentPartnerIdRef.current;
    if (!partnerId) return null;
    setBlockedIds((prev) => (prev.includes(partnerId) ? prev : [...prev, partnerId]));
    currentPartnerIdRef.current = null;
    socketRef.current?.emit("client:blocklist", {
      blockedIds: [...blockedIds, partnerId],
    });
    return partnerId;
  }, [blockedIds]);

  const onMatched = useCallback(
    (cb: (payload: { room: string; partnerId: string; initiator: boolean }) => void) => {
      socketRef.current?.on("server:matched", (payload: { room: string; partnerId: string; initiator: boolean }) => {
        currentPartnerIdRef.current = payload.partnerId;
        cb(payload);
      });
    },
    []
  );
  const onPartnerLeft = useCallback(
    (cb: (payload: { reason: string }) => void) => {
      socketRef.current?.on("server:partner_left", cb);
    },
    []
  );
  const onOffer = useCallback(
    (cb: (sdp: RTCSessionDescriptionInit) => void) => {
      socketRef.current?.on("server:offer", cb);
    },
    []
  );
  const onAnswer = useCallback(
    (cb: (sdp: RTCSessionDescriptionInit) => void) => {
      socketRef.current?.on("server:answer", cb);
    },
    []
  );
  const onIce = useCallback(
    (cb: (candidate: RTCIceCandidateInit) => void) => {
      socketRef.current?.on("server:ice", cb);
    },
    []
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  // Listen for incoming chat messages.
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const handler = (payload: { text: string; from: "me" | "stranger"; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          text: payload.text,
          from: payload.from,
          timestamp: payload.timestamp,
        },
      ]);
    };
    s.on("server:message", handler);
    return () => {
      s.off("server:message", handler);
    };
  }, [userId]);

  return {
    status,
    setStatus,
    messages,
    startSearch,
    next,
    endChat,
    sendMessage,
    reportUser,
    blockCurrentUser,
    blockedIds,
    socket: socketRef.current,
    onMatched,
    onPartnerLeft,
    onOffer,
    onAnswer,
    onIce,
    clearMessages,
  } as MatchmakingApi;
}
