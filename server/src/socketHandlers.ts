import { Server, Socket } from "socket.io";
import {
  addToQueue,
  removeFromQueue,
  endSession,
  getPartnerSocketId,
  addReport,
} from "./matchmaking.js";

interface ClientMeta {
  userId: string;
  blockedIds: string[];
}

const clientMeta = new Map<string, ClientMeta>();

// Simple per-socket rate limiting for chat messages.
const messageTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_MAX = 10;
const MAX_MESSAGE_LENGTH = 500;

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const recent = (messageTimestamps.get(socketId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  messageTimestamps.set(socketId, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    socket.on("client:identify", (payload: { userId: string }) => {
      if (!payload || typeof payload.userId !== "string") return;
      clientMeta.set(socket.id, { userId: payload.userId, blockedIds: [] });
    });

    socket.on("client:blocklist", (payload: { blockedIds: string[] }) => {
      const meta = clientMeta.get(socket.id);
      if (meta && Array.isArray(payload?.blockedIds)) {
        meta.blockedIds = payload.blockedIds.filter(
          (id) => typeof id === "string"
        );
      }
    });

    socket.on("client:start_search", (payload: { blockedIds?: string[] }) => {
      const meta = clientMeta.get(socket.id);
      if (!meta) return;
      if (Array.isArray(payload?.blockedIds)) {
        meta.blockedIds = payload.blockedIds.filter(
          (id) => typeof id === "string"
        );
      }

      // Leave any existing session first.
      leaveCurrentSession(io, socket, "searching_again");

      const result = addToQueue(socket.id, meta.userId, meta.blockedIds);
      if (result.matched && result.room && result.partnerSocketId) {
        // Notify both clients. The one with the lower "initiator" flag creates the offer.
        socket.join(result.room);
        io.sockets.sockets.get(result.partnerSocketId)?.join(result.room);
        socket.emit("server:matched", {
          room: result.room,
          partnerId: clientMeta.get(result.partnerSocketId)?.userId,
          initiator: true,
        });
        io.to(result.partnerSocketId).emit("server:matched", {
          room: result.room,
          partnerId: meta.userId,
          initiator: false,
        });
      } else {
        socket.emit("server:searching");
      }
    });

    socket.on("client:next", () => {
      leaveCurrentSession(io, socket, "nexted");
      const meta = clientMeta.get(socket.id);
      if (!meta) return;
      const result = addToQueue(socket.id, meta.userId, meta.blockedIds);
      if (result.matched && result.room && result.partnerSocketId) {
        socket.join(result.room);
        io.sockets.sockets.get(result.partnerSocketId)?.join(result.room);
        socket.emit("server:matched", {
          room: result.room,
          partnerId: clientMeta.get(result.partnerSocketId)?.userId,
          initiator: true,
        });
        io.to(result.partnerSocketId).emit("server:matched", {
          room: result.room,
          partnerId: meta.userId,
          initiator: false,
        });
      } else {
        socket.emit("server:searching");
      }
    });

    socket.on("client:end_chat", () => {
      leaveCurrentSession(io, socket, "ended");
    });

    // WebRTC signaling — relay to the partner only.
    socket.on("client:offer", (payload: { sdp: RTCSessionDescriptionInit }) => {
      const partner = getPartnerSocketId(socket.id);
      if (partner) io.to(partner).emit("server:offer", payload);
    });

    socket.on("client:answer", (payload: { sdp: RTCSessionDescriptionInit }) => {
      const partner = getPartnerSocketId(socket.id);
      if (partner) io.to(partner).emit("server:answer", payload);
    });

    socket.on("client:ice", (payload: { candidate: RTCIceCandidateInit }) => {
      const partner = getPartnerSocketId(socket.id);
      if (partner) io.to(partner).emit("server:ice", payload);
    });

    // Text chat — relay to the partner with length + rate limits.
    socket.on(
      "client:message",
      (payload: { text: string }) => {
        if (typeof payload?.text !== "string") return;
        const text = payload.text.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!text) return;
        if (isRateLimited(socket.id)) {
          socket.emit("server:error", { message: "You're sending messages too fast." });
          return;
        }
        const partner = getPartnerSocketId(socket.id);
        const meta = clientMeta.get(socket.id);
        if (partner && meta) {
          io.to(partner).emit("server:message", {
            text,
            from: "stranger",
            timestamp: Date.now(),
          });
          socket.emit("server:message", {
            text,
            from: "me",
            timestamp: Date.now(),
          });
        }
      }
    );

    // Reports.
    socket.on(
      "client:report",
      (payload: { reason: string; detail: string }) => {
        const meta = clientMeta.get(socket.id);
        const partner = getPartnerSocketId(socket.id);
        const partnerMeta = partner ? clientMeta.get(partner) : undefined;
        if (!meta || !partnerMeta) return;
        const report = addReport({
          reporterId: meta.userId,
          reportedId: partnerMeta.userId,
          reason: String(payload?.reason || "other").slice(0, 50),
          detail: String(payload?.detail || "").slice(0, 1000),
        });
        socket.emit("server:report_received", { id: report.id });
      }
    );

    socket.on("disconnect", () => {
      leaveCurrentSession(io, socket, "disconnected");
      removeFromQueue(socket.id);
      clientMeta.delete(socket.id);
      messageTimestamps.delete(socket.id);
    });
  });
}

function leaveCurrentSession(
  io: Server,
  socket: Socket,
  reason: "searching_again" | "nexted" | "ended" | "disconnected"
): void {
  const partner = getPartnerSocketId(socket.id);
  const session = endSession(socket.id);
  if (session && partner) {
    socket.leave(session.roomId);
    io.sockets.sockets.get(partner)?.leave(session.roomId);
    io.to(partner).emit("server:partner_left", { reason });
  }
}
