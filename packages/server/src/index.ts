import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { flagRouter } from "./routes/flags.js";
import { streamRouter } from "./routes/stream.js";
import { environmentRouter } from "./routes/environments.js";
import { auditLogRouter } from "./routes/auditLogs.js";
import { experimentRouter } from "./routes/experiments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/flags", flagRouter);
app.use("/api/experiments", experimentRouter);
app.use("/api/environments", environmentRouter);
app.use("/api/audit-logs", auditLogRouter);
app.use("/api", streamRouter);

app.listen(PORT, () => {
    console.log(`DarkDeploy Server running on http://localhost:${PORT}`);
    console.log(`SSE Stream ready at http://localhost:${PORT}/api/stream`);
});
