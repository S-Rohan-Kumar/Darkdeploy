import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { sseManager } from "../services/sseManager.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { calculateZTest, Variant, ZTestResult } from "@darkdeploy/core";

export async function getExperiments(req: AuthenticatedRequest, res: Response) {
    try {
        const environmentId = req.query.environmentId as string;
        if (!environmentId) {
            return res.status(400).json({ error: "environmentId is required" });
        }

        const experiments = await prisma.experiment.findMany({
            where: { environmentId },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ experiments });
    } catch (error) {
        console.error("Failed to fetch experiments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function createExperiment(req: AuthenticatedRequest, res: Response) {
    try {
        const { key, name, description, variants, environmentId } = req.body;
        const userId = req.user?.id;

        if (!key || !name || !environmentId || !variants || !Array.isArray(variants)) {
            return res.status(400).json({ error: "key, name, environmentId, and variants are required" });
        }

        const experiment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const exp = await tx.experiment.create({
                data: {
                    key,
                    name,
                    description,
                    variants,
                    environmentId,
                    enabled: true,
                },
            });

            await tx.auditLog.create({
                data: {
                    userId,
                    action: "EXPERIMENT_CREATED",
                    diff: { after: exp },
                },
            });

            return exp;
        });

        sseManager.broadcast(environmentId, "experiment_created", experiment);

        return res.status(201).json({ experiment });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "An experiment with this key already exists in this environment" });
        }
        console.error("Failed to create experiment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateExperiment(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { enabled, name, description, variants } = req.body;

        const existing = await prisma.experiment.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Experiment not found" });
        }

        const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const exp = await tx.experiment.update({
                where: { id },
                data: {
                    enabled: enabled !== undefined ? enabled : existing.enabled,
                    name: name ?? existing.name,
                    description: description ?? existing.description,
                    variants: variants ?? existing.variants,
                },
            });

            await tx.auditLog.create({
                data: {
                    userId,
                    action: "EXPERIMENT_UPDATED",
                    diff: { before: existing, after: exp },
                },
            });

            return exp;
        });

        sseManager.broadcast(updated.environmentId, "experiment_updated", updated);

        return res.json({ experiment: updated });
    } catch (error) {
        console.error("Failed to update experiment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteExperiment(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const existing = await prisma.experiment.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Experiment not found" });
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.auditLog.create({
                data: {
                    userId,
                    action: "EXPERIMENT_DELETED",
                    diff: { experimentKey: existing.key, id },
                },
            });

            await tx.experiment.delete({ where: { id } });
        });

        sseManager.broadcast(existing.environmentId, "experiment_deleted", { key: existing.key });

        return res.json({ message: "Experiment deleted successfully" });
    } catch (error) {
        console.error("Failed to delete experiment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function trackEvent(req: AuthenticatedRequest, res: Response) {
    try {
        const { experimentKey, contextId, variantKey, type, value } = req.body;
        const environmentId = req.environment?.id || req.body.environmentId;

        if (!experimentKey || !contextId || !variantKey || !type || !environmentId) {
            return res.status(400).json({ error: "experimentKey, contextId, variantKey, type, and environmentId are required" });
        }

        const experiment = await prisma.experiment.findUnique({
            where: {
                key_environmentId: {
                    key: experimentKey,
                    environmentId,
                },
            },
        });

        if (!experiment) {
            return res.status(404).json({ error: "Experiment not found" });
        }

        const event = await prisma.experimentEvent.create({
            data: {
                experimentId: experiment.id,
                contextId,
                variantKey,
                type: type.toUpperCase(),
                value: value !== undefined ? Number(value) : null,
            },
        });

        return res.status(201).json({ success: true, eventId: event.id });
    } catch (error) {
        console.error("Failed to record event:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getExperimentResults(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;

        const experiment = await prisma.experiment.findUnique({
            where: { id },
            include: { events: true },
        });

        if (!experiment) {
            return res.status(404).json({ error: "Experiment not found" });
        }

        const variants = (experiment.variants as unknown as Variant[]) || [];
        const controlVariant = variants[0] || { key: "control" };

        const variantStats: Record<string, { exposures: number; conversions: number; conversionRate: number }> = {};

        for (const v of variants) {
            variantStats[v.key] = { exposures: 0, conversions: 0, conversionRate: 0 };
        }

        for (const event of experiment.events) {
            if (!variantStats[event.variantKey]) {
                variantStats[event.variantKey] = { exposures: 0, conversions: 0, conversionRate: 0 };
            }

            if (event.type === "EXPOSURE") {
                variantStats[event.variantKey].exposures += 1;
            } else if (event.type === "CONVERSION") {
                variantStats[event.variantKey].conversions += 1;
            }
        }

        for (const key of Object.keys(variantStats)) {
            const stats = variantStats[key];
            stats.conversionRate = stats.exposures > 0 ? stats.conversions / stats.exposures : 0;
        }

        const significanceResults: Record<string, ZTestResult | null> = {};
        const controlStats = variantStats[controlVariant.key] || { exposures: 0, conversions: 0 };

        for (const v of variants) {
            if (v.key === controlVariant.key) {
                significanceResults[v.key] = null;
                continue;
            }

            const currentStats = variantStats[v.key] || { exposures: 0, conversions: 0 };
            significanceResults[v.key] = calculateZTest(controlStats, currentStats);
        }

        return res.json({
            experiment: {
                id: experiment.id,
                key: experiment.key,
                name: experiment.name,
                enabled: experiment.enabled,
                variants,
            },
            variantStats,
            significanceResults,
            totalEvents: experiment.events.length,
        });
    } catch (error) {
        console.error("Failed to calculate experiment results:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}