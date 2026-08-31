import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socketHandlers.js";
import { getQueueSize, getReports } from "./matchmaking.js";

const PORT = Number(process.env.PORT || 4000);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json({ limit: "64kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, waiting: getQueueSize() });
});

app.get("/reports", (_req, res) => {
  res.json({ reports: getReports() });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL],
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e6,
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Strangerly signaling server running on port ${PORT}`);
  console.log(`Accepting clients from ${CLIENT_URL}`);
});
