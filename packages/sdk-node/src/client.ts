import EventSource from "eventsource";
import {
    Flag,
    EvaluationContext,
    evaluate,
    EvaluationResult,
    Experiment,
    Variant,
    assignVariant,
} from "@darkdeploy/core";

export interface ClientConfig {
    apiKey: string;
    baseUrl?: string;
}

export class DarkDeployClient {
    private apiKey: string;
    private baseUrl: string;
    private flagsCache: Map<string, Flag> = new Map();
    private experimentsCache: Map<string, Experiment> = new Map();
    private eventSource: EventSource | null = null;
    private isInitialized = false;

    private reconnectAttempts = 0;
    private maxReconnectDelay = 30_000;
    private baseReconnectDelay = 1_000;

    constructor(config: ClientConfig) {
        if (!config.apiKey) {
            throw new Error("DarkDeployClient requires an apiKey");
        }
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || "http://localhost:4000";
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        await Promise.all([
            this.fetchFlagsSnapshot(),
            this.fetchExperimentsSnapshot(),
        ]);

        this.connectStream();
        this.isInitialized = true;
    }

    private async fetchFlagsSnapshot(): Promise<void> {
        try {
            const res = await fetch(`${this.baseUrl}/api/sdk/flags`, {
                headers: { "x-api-key": this.apiKey },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch flags snapshot: HTTP ${res.status}`);
            }
            const data = (await res.json()) as { flags: Flag[] };
            this.flagsCache.clear();
            for (const flag of data.flags) {
                this.flagsCache.set(flag.key, flag);
            }
        } catch (err) {
            console.error("[DarkDeploy SDK] Flags snapshot initialization failed:", err);
        }
    }

    private async fetchExperimentsSnapshot(): Promise<void> {
        try {
            const res = await fetch(`${this.baseUrl}/api/sdk/experiments`, {
                headers: { "x-api-key": this.apiKey },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch experiments snapshot: HTTP ${res.status}`);
            }
            const data = (await res.json()) as { experiments: Experiment[] };
            this.experimentsCache.clear();
            for (const exp of data.experiments) {
                this.experimentsCache.set(exp.key, exp);
            }
        } catch (err) {
            console.error("[DarkDeploy SDK] Experiments snapshot initialization failed:", err);
        }
    }

    private connectStream(): void {
        const streamUrl = `${this.baseUrl}/api/stream`;
        this.eventSource = new EventSource(streamUrl, {
            headers: { "x-api-key": this.apiKey },
        });

        this.eventSource.onopen = () => {
            this.reconnectAttempts = 0;
        };

        this.eventSource.addEventListener("flag_created", (event: any) => {
            try {
                const flag: Flag = JSON.parse(event.data);
                this.flagsCache.set(flag.key, flag);
                console.log(`⚡ [SSE Event] Flag '${flag.key}' created.`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse flag_created event:", err);
            }
        });

        this.eventSource.addEventListener("flag_updated", (event: any) => {
            try {
                const flag: Flag = JSON.parse(event.data);
                this.flagsCache.set(flag.key, flag);
                console.log(`⚡ [SSE Event] Flag '${flag.key}' updated -> enabled: ${flag.enabled}, rollout: ${flag.rolloutPercentage ?? 0}%`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse flag_updated event:", err);
            }
        });

        this.eventSource.addEventListener("flag_deleted", (event: any) => {
            try {
                const { key } = JSON.parse(event.data);
                this.flagsCache.delete(key);
                console.log(`⚡ [SSE Event] Flag '${key}' deleted.`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse flag_deleted event:", err);
            }
        });

        this.eventSource.addEventListener("experiment_created", (event: any) => {
            try {
                const exp: Experiment = JSON.parse(event.data);
                this.experimentsCache.set(exp.key, exp);
                console.log(`⚡ [SSE Event] Experiment '${exp.key}' created -> enabled: ${exp.enabled}`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse experiment_created event:", err);
            }
        });

        this.eventSource.addEventListener("experiment_updated", (event: any) => {
            try {
                const exp: Experiment = JSON.parse(event.data);
                this.experimentsCache.set(exp.key, exp);
                console.log(`⚡ [SSE Event] Experiment '${exp.key}' updated -> enabled: ${exp.enabled}`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse experiment_updated event:", err);
            }
        });

        this.eventSource.addEventListener("experiment_deleted", (event: any) => {
            try {
                const { key } = JSON.parse(event.data);
                this.experimentsCache.delete(key);
                console.log(`⚡ [SSE Event] Experiment '${key}' deleted.`);
            } catch (err) {
                console.error("[DarkDeploy SDK] Failed to parse experiment_deleted event:", err);
            }
        });

        this.eventSource.onerror = () => {
            this.eventSource?.close();
            this.eventSource = null;
            this.scheduleReconnect();
        };
    }

    private scheduleReconnect(): void {
        const delay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectDelay
        );
        const jitter = Math.random() * 500;
        const finalDelay = delay + jitter;
        this.reconnectAttempts++;

        setTimeout(() => {
            this.connectStream();
        }, finalDelay);
    }

    public evaluate(flagKey: string, context: EvaluationContext, defaultValue = false): EvaluationResult {
        const flag = this.flagsCache.get(flagKey);
        if (!flag) {
            return {
                value: defaultValue,
                reason: "DEFAULT",
            };
        }
        return evaluate(flag, context);
    }

    public isEnabled(flagKey: string, context: EvaluationContext, defaultValue = false): boolean {
        return this.evaluate(flagKey, context, defaultValue).value;
    }

    public getVariant(
        experimentKey: string,
        context: EvaluationContext,
        _fallbackKey = "control"
    ): Variant | null {
        const experiment = this.experimentsCache.get(experimentKey);
        if (!experiment || !experiment.enabled) {
            return null;
        }

        const assignment = assignVariant(experiment, context);
        if (!assignment) {
            return null;
        }

        this.track(experimentKey, context, "EXPOSURE", undefined, assignment.variant.key).catch(() => {});

        return assignment.variant;
    }

    public async track(
        experimentKey: string,
        context: EvaluationContext,
        type: "EXPOSURE" | "CONVERSION" = "CONVERSION",
        value?: number,
        variantKey?: string
    ): Promise<void> {
        try {
            const contextId = context.id || (context as any).key;
            if (!contextId) return;

            let finalVariantKey = variantKey;
            if (!finalVariantKey) {
                const experiment = this.experimentsCache.get(experimentKey);
                if (experiment) {
                    const assignment = assignVariant(experiment, context);
                    finalVariantKey = assignment?.variant.key;
                }
            }

            if (!finalVariantKey) return;

            await fetch(`${this.baseUrl}/api/experiments/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify({
                    experimentKey,
                    contextId,
                    variantKey: finalVariantKey,
                    type,
                    value,
                    environmentId: undefined,
                }),
            });
        } catch (err) {
            console.error("[DarkDeploy SDK] Failed to track experiment event:", err);
        }
    }

    public close(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.flagsCache.clear();
        this.experimentsCache.clear();
        this.isInitialized = false;
    }
}