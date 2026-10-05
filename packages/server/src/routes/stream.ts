import { Router, Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../db.js";
import { sseManager } from "../services/sseManager.js";
import {
    authenticateApiKey,
    AuthenticatedRequest,
} from "../middleware/auth.js";

export const streamRouter = Router();

streamRouter.use(authenticateApiKey);

streamRouter.get("/sdk/flags", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const environmentId = req.environment!.id;

        const flags = await prisma.flag.findMany({
            where: { environmentId },
            include: {
                rules: {
                    orderBy: { priority: "asc" },
                },
            },
        });

        return res.json({ flags });
    } catch (error) {
        console.error("Failed to fetch SDK flags:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

streamRouter.get("/stream", (req: AuthenticatedRequest, res: Response) => {
    const environmentId = req.environment!.id;
    const clientId = crypto.randomUUID();

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    res.flushHeaders?.();

    sseManager.addClient(clientId, environmentId, res);
});


streamRouter.get("/sdk/experiments", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const environmentId = req.environment!.id;
        const experiments = await prisma.experiment.findMany({
            where: { environmentId },
        });
        return res.json({ experiments });
    } catch (error) {
        console.error("Failed to fetch SDK experiments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});