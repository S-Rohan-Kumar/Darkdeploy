import { Response } from "express";
import { prisma } from "../db.js";
import { sseManager } from "../services/sseManager.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getFlags(req: AuthenticatedRequest, res: Response) {
    try {
        const environmentId = req.query.environmentId as string;
        if (!environmentId) {
            return res
                .status(400)
                .json({ error: "environmentId query param is required" });
        }
        const flags = await prisma.flag.findMany({
            where: { environmentId },
            include: {
                rules: {
                    orderBy: { priority: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ flags });
    } catch (error) {
        console.error("Failed to fetch flags:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function createFlag(req: AuthenticatedRequest, res: Response) {
    try {
        const {
            key,
            name,
            description,
            environmentId,
            defaultValue,
            rolloutPercentage,
            type,
            aiConfig,
        } = req.body;
        const userId = req.user?.id;
        if (!key || !name || !environmentId) {
            return res
                .status(400)
                .json({ error: "key, name, and environmentId are required" });
        }
        const newFlag = await prisma.$transaction(async (tx) => {
            const flag = await tx.flag.create({
                data: {
                    key,
                    name,
                    description,
                    environmentId,
                    type: type ?? "BOOLEAN",
                    aiConfig: aiConfig ?? null,
                    defaultValue: defaultValue ?? false,
                    rolloutPercentage: rolloutPercentage ?? 0.0,
                    enabled: false,
                },
                include: { rules: true },
            });
            await tx.auditLog.create({
                data: {
                    flagId: flag.id,
                    userId,
                    action: "FLAG_CREATED",
                    diff: { after: flag },
                },
            });
            return flag;
        });
        sseManager.broadcast(environmentId, "flag_created", newFlag);
        return res.status(201).json({ flag: newFlag });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "A flag with this key already exists in this environment",
            });
        }
        console.error("Failed to create flag:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteFlag(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const existingFlag = await prisma.flag.findUnique({ where: { id } });
        if (!existingFlag) {
            return res.status(404).json({ error: "Flag not found" });
        }
        await prisma.$transaction(async (tx) => {
            await tx.auditLog.create({
                data: {
                    flagId: null,
                    userId,
                    action: "FLAG_DELETED",
                    diff: { deletedFlagKey: existingFlag.key, flagId: id },
                },
            });
            await tx.flag.delete({
                where: { id },
            });
        });
        sseManager.broadcast(existingFlag.environmentId, "flag_deleted", {
            key: existingFlag.key,
        });
        return res.json({ message: "Flag deleted successfully" });
    } catch (error) {
        console.error("Failed to delete flag:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateFlag(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const {
            enabled,
            rolloutPercentage,
            defaultValue,
            name,
            description,
            rules,
            type,
            aiConfig,
        } = req.body;
        const existingFlag = await prisma.flag.findUnique({
            where: { id },
            include: { rules: true },
        });
        if (!existingFlag) {
            return res.status(404).json({ error: "Flag not found" });
        }
        const updatedFlag = await prisma.$transaction(async (tx) => {
            if (rules && Array.isArray(rules)) {
                await tx.targetingRule.deleteMany({ where: { flagId: id } });
                if (rules.length > 0) {
                    await tx.targetingRule.createMany({
                        data: rules.map((r: any, index: number) => ({
                            flagId: id,
                            attribute: r.attribute,
                            operator: r.operator,
                            values: r.values,
                            serveValue: r.serveValue ?? true,
                            priority: index + 1,
                        })),
                    });
                }
            }
            const flag = await tx.flag.update({
                where: { id },
                data: {
                    enabled:
                        enabled !== undefined ? enabled : existingFlag.enabled,
                    rolloutPercentage:
                        rolloutPercentage !== undefined
                            ? rolloutPercentage
                            : existingFlag.rolloutPercentage,
                    defaultValue:
                        defaultValue !== undefined
                            ? defaultValue
                            : existingFlag.defaultValue,
                    name: name ?? existingFlag.name,
                    description: description ?? existingFlag.description,
                    type: type ?? existingFlag.type,
                    aiConfig: aiConfig !== undefined ? aiConfig : existingFlag.aiConfig,
                },
                include: {
                    rules: { orderBy: { priority: "asc" } },
                },
            });
            await tx.auditLog.create({
                data: {
                    flagId: id,
                    userId,
                    action: "FLAG_UPDATED",
                    diff: {
                        before: {
                            enabled: existingFlag.enabled,
                            rolloutPercentage: existingFlag.rolloutPercentage,
                            defaultValue: existingFlag.defaultValue,
                        },
                        after: {
                            enabled: flag.enabled,
                            rolloutPercentage: flag.rolloutPercentage,
                            defaultValue: flag.defaultValue,
                        },
                    },
                },
            });
            return flag;
        });
        sseManager.broadcast(
            updatedFlag.environmentId,
            "flag_updated",
            updatedFlag,
        );
        return res.json({ flag: updatedFlag });
    } catch (error) {
        console.error("Failed to update flag:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
