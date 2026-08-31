export interface WaitingUser {
  id: string;
  socketId: string;
  joinedAt: number;
  blockedIds: string[];
}

export interface ActiveSession {
  roomId: string;
  userA: string;
  userB: string;
  startedAt: number;
}

// In-memory matchmaking queue keyed by socket id.
const waitingQueue = new Map<string, WaitingUser>();

// Active sessions keyed by roomId and by each participant's socket id.
const sessionsByRoom = new Map<string, ActiveSession>();
const sessionBySocket = new Map<string, ActiveSession>();

export function addToQueue(
  socketId: string,
  userId: string,
  blockedIds: string[]
): { matched: boolean; room?: string; partnerSocketId?: string } {
  // Don't re-add if already waiting.
  if (waitingQueue.has(socketId)) {
    return { matched: false };
  }

  // Try to find a compatible partner: not the same user, not blocked by either side.
  for (const [candidateSocket, candidate] of waitingQueue) {
    if (candidate.id === userId) continue;
    if (blockedIds.includes(candidate.id)) continue;
    if (candidate.blockedIds.includes(userId)) continue;

    // Found a match — remove candidate from queue and create a room.
    waitingQueue.delete(candidateSocket);
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const session: ActiveSession = {
      roomId,
      userA: userId,
      userB: candidate.id,
      startedAt: Date.now(),
    };
    sessionsByRoom.set(roomId, session);
    sessionBySocket.set(socketId, session);
    sessionBySocket.set(candidateSocket, session);
    return { matched: true, room: roomId, partnerSocketId: candidateSocket };
  }

  // No compatible partner — add to queue and wait.
  waitingQueue.set(socketId, {
    id: userId,
    socketId,
    joinedAt: Date.now(),
    blockedIds,
  });
  return { matched: false };
}

export function removeFromQueue(socketId: string): WaitingUser | undefined {
  const user = waitingQueue.get(socketId);
  if (user) waitingQueue.delete(socketId);
  return user;
}

export function endSession(socketId: string): ActiveSession | undefined {
  const session = sessionBySocket.get(socketId);
  if (!session) return undefined;

  sessionBySocket.delete(socketId);
  // Delete the other participant's mapping too.
  const otherSocket = [...sessionBySocket.entries()].find(
    ([, s]) => s.roomId === session.roomId
  );
  if (otherSocket) sessionBySocket.delete(otherSocket[0]);
  sessionsByRoom.delete(session.roomId);
  return session;
}

export function getSessionBySocket(socketId: string): ActiveSession | undefined {
  return sessionBySocket.get(socketId);
}

export function getPartnerSocketId(socketId: string): string | undefined {
  const session = sessionBySocket.get(socketId);
  if (!session) return undefined;
  for (const [sid, s] of sessionBySocket) {
    if (s.roomId === session.roomId && sid !== socketId) return sid;
  }
  return undefined;
}

export function getQueueSize(): number {
  return waitingQueue.size;
}

// Temporary in-memory report store (swap for a database later).
export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  detail: string;
  createdAt: number;
}

const reports: Report[] = [];

export function addReport(report: Omit<Report, "id" | "createdAt">): Report {
  const entry: Report = {
    ...report,
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  reports.push(entry);
  return entry;
}

export function getReports(): Report[] {
  return [...reports];
}
