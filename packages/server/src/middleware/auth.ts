import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    environment?: {
        id: string;
        name: string;
        key: string;
    };
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export function authenticateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
        return;
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}

export async function authenticateApiKey(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
        res.status(401).json({ error: "Missing x-api-key header" });
        return;
    }

    try {
        const environment = await prisma.environment.findUnique({
            where: { apiKey },
            select: {
                id: true,
                name: true,
                key: true,
            },
        });

        if (!environment) {
            res.status(401).json({ error: "Invalid API key" });
            return;
        }

        req.environment = environment;
        next();
        return;
    } catch (error) {
        res.status(500).json({ error: "Authentication service failure" });
        return;
    }
}
